from typing import Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import json
import requests
from typing import Optional, Dict, Any
from scrap import scrape_instagram_profile
import logging
import os

app = FastAPI()

# CONFIGURATION
BASE_API_URL = "https://api.langflow.astra.datastax.com"
LANGFLOW_ID = "9edb9b8e-f9ed-418a-8cf9-4c44fb6c36b7"
FLOW_ID = "8f31b8ec-f233-42de-80b2-e4531bdd709e"
APPLICATION_TOKEN = os.getenv("APPLICATION_TOKEN")
ENDPOINT = FLOW_ID

# Tweaks
TWEAKS = {
    "ChatInput-PVxoG": {},
    "ChatOutput-QqjiD": {},
    "Prompt-pXVnT": {},
    "Agent-UcVdC": {
        "temperature": 0.7,
        "model_name": "gpt-4o-mini"  # gpt model 
    },
    "AstraDBToolComponent-Wy97B": {
        "collection_name": "instagram_data",
        "database_name": "your_database_name",  # database name
        "keyspace_name": "your_keyspace"        # keyspace
    }
}

# Request model
class FlowRequest(BaseModel):
    message: str
    tweaks: Optional[Dict[str, Any]] = TWEAKS
    output_type: str = "chat"
    input_type: str = "chat"

# Add logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_flow(message: str,
                  endpoint: str,
                  output_type: str = "chat",
                  input_type: str = "chat",
                  tweaks: Optional[dict] = None) -> dict:
    """Run a flow with a given message and optional tweaks."""
    api_url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{endpoint}"

    payload = {
        "input_value": message,
        "output_type": output_type,
        "input_type": input_type,
    }
    
    headers = {
        "Authorization": f"Bearer {APPLICATION_TOKEN}",
        "Content-Type": "application/json"
    }

    if tweaks:
        payload["tweaks"] = tweaks

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        if hasattr(e.response, 'text'):
            logger.error(f"Response text: {e.response.text}")
        raise HTTPException(
            status_code=500, 
            detail=f"Flow execution failed: {str(e)}"
        )

def clean_response(raw_response):
    """Clean and format the Langflow response"""
    try:
        logger.info(f"Raw response: {json.dumps(raw_response, indent=2)}")
        
        if not raw_response.get('outputs'):
            return {
                "status": "error",
                "message": "No outputs in response"
            }

        outputs = raw_response['outputs'][0]
        
        # Handle case where outputs might be empty or malformed
        if not outputs or not isinstance(outputs, dict):
            return {
                "status": "error",
                "message": "Malformed output structure"
            }

        # Extract message from nested structure
        message = (outputs.get('outputs', [{}])[0]
                  .get('results', {})
                  .get('message', {}))

        cleaned_response = {
            "status": "success",
            "message": {
                "text": message.get('text', ''),
                "timestamp": message.get('timestamp', ''),
                "session_id": message.get('session_id', '')
            }
        }

        # Extract content blocks if they exist
        content_blocks = message.get('content_blocks', [])
        if content_blocks:
            cleaned_response['agent_steps'] = [
                block.get('contents', [])
                for block in content_blocks
                if block.get('title') == 'Agent Steps'
            ]

        return cleaned_response

    except Exception as e:
        logger.error(f"Error formatting response: {str(e)}")
        return {
            "status": "error",
            "message": f"Error formatting response: {str(e)}"
        }

@app.get("/")
def read_root():
    return {"Applicaiton Working": "True"}

@app.post("/run-flow")
async def process_flow(request: FlowRequest):
    """
    Process a flow with the given message and parameters
    """
    try:
        logger.info(f"Processing request with message: {request.message}")
        
        raw_response = await run_flow(
            message=request.message,
            endpoint=ENDPOINT,
            output_type=request.output_type,
            input_type=request.input_type,
            tweaks=request.tweaks
        )
        
        # Format the response
        formatted_response = clean_response(raw_response)
        
        if formatted_response.get("status") == "error":
            raise HTTPException(
                status_code=500,
                detail=formatted_response.get("message", "Unknown error occurred")
            )
            
        return formatted_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}  #124 lines

class InstagramRequest(BaseModel):
    username: str
    results_limit: int = 5

    @validator('results_limit')
    def validate_results_limit(cls, v):
        if v < 1:
            raise ValueError('results_limit must be at least 1')
        if v > 50:  # Set a reasonable maximum
            raise ValueError('results_limit cannot exceed 50')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "username": "cristiano",
                "results_limit": 20
            }
        }

class PostInsertStatus(BaseModel):
    post_id: str
    post_data: dict
    post_number: str
    db_insert_status: bool
    insert_message: str

class InstagramResponse(BaseModel):
    success: bool
    profile_data: Optional[dict]
    posts_data: list[PostInsertStatus]
    total_posts: int
    error: Optional[str] = None
    db_status: bool
    db_message: str

@app.post("/scrape-instagram/", response_model=InstagramResponse)
async def scrape_instagram(request: InstagramRequest):
    """
    Scrape Instagram profile and posts data with database insertion status
    
    Parameters:
    - username: Instagram username to scrape
    - results_limit: Number of posts to fetch (default: 5)
    
    Returns:
    - Profile data
    - Posts data with individual DB insertion status
    - Total posts count
    - Database operation status
    """
    try:
        result = scrape_instagram_profile(
            username=request.username,
            results_limit=request.results_limit
        )
        
        if not result['success']:
            raise HTTPException(
                status_code=400,
                detail=result['error'] or "Failed to scrape Instagram data"
            )
        
        # Add total_posts to the result
        result['total_posts'] = result['profile_data'].get('total_posts', len(result['posts_data']))
            
        return {
            "success": result['success'],
            "profile_data": result['profile_data'],
            "posts_data": result['posts_data'],
            "total_posts": result['total_posts'],
            "error": result.get('error'),
            "db_status": result.get('db_status', False),
            "db_message": result.get('db_message', '')
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/test-config")
async def test_configuration():
    """Test the configuration and connections"""
    try:
        # Test basic message
        test_response = await run_flow(
            message="Hello, this is a test message",
            endpoint=ENDPOINT,
            tweaks=TWEAKS
        )
        return {
            "status": "success",
            "config_test": "passed",
            "langflow_id": LANGFLOW_ID,
            "flow_id": FLOW_ID,
            "test_response": test_response
        }
    except Exception as e:
        logger.error(f"Configuration test failed: {str(e)}")
        return {
            "status": "error",
            "config_test": "failed",
            "error_message": str(e),
            "langflow_id": LANGFLOW_ID,
            "flow_id": FLOW_ID
        }




#--------------------------------------------------------------------------------------------------------#


from apify_client import ApifyClient
from urllib.parse import urlparse
from datetime import datetime
from vectorStaxConnect import db  # Import the database connection from vectorStaxConnect

# Initialize the ApifyClient with your API token
apify_client = ApifyClient('apify_api_KzmKE3wuJeT7jacl4mceqjwJGkfYCS0CFPIg')

def get_instagram_username(url):
    parsed_url = urlparse(url)
    username = parsed_url.path.strip('/').split('/')[0]
    return username

def delete_user_data(username):
    """Delete all data for a specific username"""
    try:
        instagram_collection = db.get_collection("instagram_data")
        instagram_collection.delete_many({"username": username})
        print(f"🗑️ Deleted previous data for username: {username}")
    except Exception as e:
        print(f"❌ Error deleting user data: {str(e)}")

def insert_post_to_astra(post_data):
    """Insert post data into Astra DB with status"""
    try:
        instagram_collection = db.get_collection("instagram_data")
        # Add a type field to identify this as a post
        post_data['data_type'] = 'post'
        instagram_collection.insert_one(post_data)
        return True, "Post data inserted successfully"
    except Exception as e:
        return False, f"Error inserting post data: {str(e)}"

def insert_profile_to_astra(profile_data):
    """Insert profile data into Astra DB"""
    try:
        instagram_collection = db.get_collection("instagram_data")
        profile_data['data_type'] = 'profile'
        instagram_collection.delete_many({
            "username": profile_data['username'],
            "data_type": "profile"
        })

        # Insert new profile data
        instagram_collection.insert_one(profile_data)
        return True, "Profile data inserted successfully"
    except Exception as e:
        return False, f"Error inserting profile data: {str(e)}"

def print_post_details(post_data):
    print("="*50)
    print(f"Post Details:")
    print("="*50)
    print(f"Username: {post_data['username']}")
    print(f"Post ID: {post_data['post_id']}")
    print(f"Type: {post_data['post_type']}")
    print(f"Likes: {post_data['likes']:,}")
    print(f"Comments: {post_data['comments']:,}")
    print(f"Shares: {post_data['shares']:,}")
    
    # Add video-specific details if post is a video
    if post_data['post_type'].lower() == 'video':
        print(f"Video Views: {post_data.get('video_views', 0):,}")
        duration = post_data.get('video_duration', 0)
        minutes = duration // 60
        seconds = duration % 60
        print(f"Video Duration: {minutes}m {seconds}s")
    
    print(f"Posted at: {post_data['timestamp']}")
    print(f"URL: {post_data['profile_url']}")
    print(f"Caption: {post_data['caption'][:100]}..." if post_data['caption'] else "Caption: None")
    print("-"*50)

def print_profile_details(profile):
    """Print formatted profile details"""
    print("\n📱 Profile Details:")
    print(f"👤 Username: {profile['username']}")
    print(f"📝 Full Name: {profile['full_name']}")
    print(f"📖 Bio: {profile['biography']}")
    print(f"👥 Followers: {profile['followers_count']}")
    print(f"👥 Following: {profile['following_count']}")
    print(f"✅ Verified: {profile['is_verified']}")
    print(f"🔗 Profile URL: {profile['profile_url']}")
    print(f"🖼️ Profile Picture: {profile['profile_pic_url']}")
    print(f"🔗 External URL: {profile['external_url']}")
    print(f"💼 Business Category: {profile['business_category']}\n")

def insert_data_to_astra(profile_data, posts_data):
    """Insert both profile and posts data as a single nested document"""
    try:
        instagram_collection = db.get_collection("instagram_data")
        
        # Create the nested structure with numbered posts
        numbered_posts = {}
        for idx, post in enumerate(posts_data, 1):  # Start counting from 1
            numbered_posts[f"post_{idx}"] = post['post_data']
        
        document = {
            "username": profile_data['username'],
            "profile_data": profile_data,
            "posts": numbered_posts,
            "last_updated": datetime.now().isoformat()
        }
        
        # Delete existing data for this username only
        instagram_collection.delete_many({"username": profile_data['username']})
        print(f"🗑️ Cleared existing data for username: {profile_data['username']}")
        
        # Insert the new nested document
        instagram_collection.insert_one(document)
        return True, "Data inserted successfully"
    except Exception as e:
        return False, f"Error inserting data: {str(e)}"

def scrape_instagram_profile(username: str, results_limit: int = 5):
    """
    Scrape Instagram profile and posts data, store in database and return results
    """
    try:
        # Ensure results_limit is an integer and print for debugging
        results_limit = int(results_limit)
        print(f"🎯 Requested {results_limit} posts")
        
        # Initialize return data
        result = {
            'profile_data': None,
            'posts_data': [],
            'success': False,
            'error': None
        }

        try:
            # First, clear ALL existing data from collection
            instagram_collection = db.get_collection("instagram_data")
            instagram_collection.delete_many({})
            print("🗑️ Cleared all existing data from database")

            # Configure input for user details
            input_data = {
                "directUrls": [f"https://www.instagram.com/{username}/"],
                "resultsType": "details",
                "searchType": "user",
                "proxy": {
                    "useApifyProxy": True,
                    "apifyProxyGroups": ["RESIDENTIAL"]
                },
                "languageCode": "en"
            }

            print(f"🔄 Starting Instagram scraper for {username}...")
            print(f"📊 Attempting to fetch {results_limit} posts...")

            # Get user details
            actor_call = apify_client.actor('apify/instagram-scraper').call(
                run_input=input_data,
                timeout_secs=120
            )
            
            profile_items = apify_client.dataset(actor_call['defaultDatasetId']).list_items().items

            if not profile_items:
                raise Exception("No profile data found")

            # Get profile data
            profile_item = profile_items[0]
            
            if 'error' in profile_item:
                raise Exception("Error in profile data")

            # Process profile data
            profile_data = {
                'username': profile_item.get('username', username),
                'full_name': profile_item.get('fullName', ''),
                'biography': profile_item.get('biography', ''),
                'followers_count': profile_item.get('followersCount', 0),
                'following_count': profile_item.get('followsCount', 0),
                'is_verified': profile_item.get('verified', False),
                'profile_pic_url': profile_item.get('profilePicUrl', ''),
                'profile_url': f"https://www.instagram.com/{username}/",
                'external_url': profile_item.get('externalUrl', ''),
                'business_category': profile_item.get('businessCategoryName', ''),
                'total_posts': profile_item.get('postsCount', 0)
            }

            result['profile_data'] = profile_data

            # Update the posts scraping configuration
            input_data.update({
                "resultsType": "posts",
                "maxItems": results_limit,  # Set the maximum items to fetch
                "searchType": "user",
                "searchLimit": results_limit,  # Set the search limit
                "extendOutputFunction": """async ({ data, item, page, customData }) => {
                    return item;
                }""",
                "scrapeStories": False,
                "scrapeHighlights": False,
                "scrapeIgtv": False,
                "scrapeReels": True,
                "scrapePosts": True,
                "scrapeComments": False,
                "sort": "newest",
                "limit": results_limit  # Add an explicit limit
            })

            # Increase timeout for larger number of posts
            actor_call = apify_client.actor('apify/instagram-scraper').call(
                run_input=input_data,
                timeout_secs=300  # Increased timeout to 5 minutes for more posts
            )
            
            posts_items = apify_client.dataset(actor_call['defaultDatasetId']).list_items().items
            posts_items = sorted(posts_items, key=lambda x: x.get('timestamp', ''), reverse=True)
            
            # Make sure we get the requested number of posts
            if len(posts_items) < results_limit:
                print(f"⚠️ Warning: Only found {len(posts_items)} posts, less than requested {results_limit}")
            
            # Process all fetched posts
            result['posts_data'] = []
            for idx, item in enumerate(posts_items[:results_limit], 1):
                if 'error' in item:
                    continue
                    
                video_duration = int(round(item.get('videoDuration', 0))) if isinstance(item.get('videoDuration'), float) else 0
                
                post_data = {
                    'post_number': f"post_{idx}",  # Add post number
                    'username': username,
                    'post_id': item.get('id', 'unknown'),
                    'post_type': item.get('type', 'unknown'),
                    'likes': item.get('likesCount', 0),
                    'comments': item.get('commentsCount', 0),
                    'shares': item.get('sharesCount', 0),
                    'timestamp': item.get('timestamp', 'unknown'),
                    'profile_url': item.get('url', ''),
                    'caption': item.get('caption', ''),
                    'video_views': item.get('videoViewCount', 0) if item.get('type', '').lower() == 'video' else 0,
                    'video_duration': video_duration if item.get('type', '').lower() == 'video' else 0
                }
                
                result['posts_data'].append({
                    'post_id': post_data['post_id'],
                    'post_data': post_data,
                    'post_number': f"post_{idx}",  # Add post number to response
                    'db_insert_status': True,
                    'insert_message': 'Post data ready'
                })

            # Store both profile and posts data together
            db_success, db_message = insert_data_to_astra(profile_data, result['posts_data'])
            result['db_status'] = db_success
            result['db_message'] = db_message

            result['success'] = True
            print(f"✅ Successfully fetched {len(result['posts_data'])} posts")

            return result

        except Exception as e:
            result['error'] = str(e)
            print(f"❌ Error processing data: {str(e)}")
            return result

    except Exception as e:
        return {
            'profile_data': None,
            'posts_data': [],
            'success': False,
            'error': f"Failed to process data: {str(e)}"
        }

if __name__ == "__main__":
    
    # Test Function Calling 
    # Test username
    test_username = "cristiano"  # or any other Instagram username you want to test
    print(f"🚀 Starting scrape for username: {test_username}")
    
    # Call the scraping function
    result = scrape_instagram_profile(test_username, results_limit=5)

    
    
    # Print results
    if result['success']:
        print("\n✅ Scraping completed successfully!")
        
        # Print profile details
        if result['profile_data']:
            print_profile_details(result['profile_data'])
        
        # Print post details
        print(f"\nFetched {len(result['posts_data'])} posts:")
        for post in result['posts_data']:
            print_post_details(post['post_data'])
    else:
        print(f"\n❌ Scraping failed: {result['error']}")