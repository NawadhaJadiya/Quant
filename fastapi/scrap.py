from apify_client import ApifyClient
from urllib.parse import urlparse
from datetime import datetime, timedelta
import asyncio
import aiohttp
from functools import lru_cache
from vectorStaxConnect import db  # Import the database connection from vectorStaxConnect
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize the ApifyClient with your API token
apify_client = ApifyClient(os.getenv("APIFY_API_TOKEN"))

# Add cache for profile data (stores results for 1 hour)
@lru_cache(maxsize=100)
def get_cached_profile(username):
    return None  # Initially None, will be populated on first fetch

def is_cache_valid(username):
    """Check if we have valid cached data"""
    cached_data = get_cached_profile(username)
    if cached_data:
        cache_time = cached_data.get('cache_time')
        if cache_time and (datetime.now() - cache_time) < timedelta(hours=1):
            return True
    return False

async def fetch_profile_data(apify_client, input_data):
    """Fetch profile data asynchronously"""
    actor_call = apify_client.actor('apify/instagram-scraper').call(
        run_input=input_data,
        timeout_secs=100  # Reduced timeout
    )
    return apify_client.dataset(actor_call['defaultDatasetId']).list_items().items

async def fetch_posts_data(apify_client, input_data):
    """Fetch posts data asynchronously"""
    actor_call = apify_client.actor('apify/instagram-scraper').call(
        run_input=input_data,
        timeout_secs=100  # Reduced timeout
    )
    return apify_client.dataset(actor_call['defaultDatasetId']).list_items().items

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
        for idx, post in enumerate(posts_data, 1):
            numbered_posts[f"post_{idx}"] = post['post_data']
        
        # Create new document
        document = {
            "username": profile_data['username'],
            "profile_data": profile_data,
            "posts": numbered_posts,
            "last_updated": datetime.now().isoformat()
        }
        
        # Insert the new nested document
        insert_result = instagram_collection.insert_one(document)
        
        if insert_result.inserted_id:
            print(f"✅ Successfully inserted new data for {profile_data['username']}")
            return True, "Data inserted successfully"
        else:
            return False, "Failed to insert data"
            
    except Exception as e:
        print(f"❌ Error in insert_data_to_astra: {str(e)}")
        return False, f"Error inserting data: {str(e)}"

def verify_data_cleanup(username):
    """Verify that old data has been cleaned up"""
    try:
        instagram_collection = db.get_collection("instagram_data")
        existing_records = instagram_collection.count_documents({
            "$or": [
                {"username": username},
                {"profile_data.username": username},
                {"posts.username": username}
            ]
        })
        print(f"📊 Found {existing_records} existing records for {username}")
        return existing_records
    except Exception as e:
        print(f"❌ Error verifying cleanup: {str(e)}")
        return None

def clear_all_instagram_data():
    """Clear all data from the instagram_data collection"""
    try:
        instagram_collection = db.get_collection("instagram_data")
        delete_result = instagram_collection.delete_many({})  # Empty filter means delete all
        print(f"🗑️ Cleared entire collection. Deleted {delete_result.deleted_count} documents")
        return True
    except Exception as e:
        print(f"❌ Error clearing collection: {str(e)}")
        return False

async def scrape_instagram_profile(username: str, results_limit: int = 5):
    """
    Optimized Instagram profile and posts scraping
    """
    try:
        results_limit = int(results_limit)
        print(f"🎯 Requested {results_limit} posts")

        # Clear all existing data from collection first
        clear_success = clear_all_instagram_data()
        if not clear_success:
            print("⚠️ Warning: Failed to clear existing data")

        # Check cache first
        if is_cache_valid(username):
            cached_data = get_cached_profile(username)
            print("✨ Returning cached data")
            return cached_data

        result = {
            'profile_data': None,
            'posts_data': [],
            'success': False,
            'error': None,
            'cache_time': datetime.now()
        }

        # Optimize input configuration
        base_input = {
            "directUrls": [f"https://www.instagram.com/{username}/"],
            "proxy": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"]
            },
            "languageCode": "en"
        }

        # Profile input configuration
        profile_input = {
            **base_input,
            "resultsType": "details",
            "searchType": "user",
        }

        # Posts input configuration
        posts_input = {
            **base_input,
            "resultsType": "posts",
            "maxItems": results_limit,
            "searchType": "user",
            "searchLimit": results_limit,
            "scrapeStories": False,
            "scrapeHighlights": False,
            "scrapeIgtv": False,
            "scrapeReels": True,
            "scrapePosts": True,
            "scrapeComments": False,
            "sort": "newest",
            "limit": results_limit
        }

        # Run profile and posts fetching in parallel
        profile_items, posts_items = await asyncio.gather(
            fetch_profile_data(apify_client, profile_input),
            fetch_posts_data(apify_client, posts_input)
        )

        if not profile_items:
            raise Exception("No profile data found")

        # Process profile data
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

        # Process posts with optimized sorting
        posts_items = sorted(
            posts_items, 
            key=lambda x: x.get('timestamp', ''), 
            reverse=True
        )[:results_limit]  # Limit posts early

        # Process posts data
        for idx, item in enumerate(posts_items, 1):
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

        # Verify and log existing data before deletion
        existing_count = verify_data_cleanup(username)
        print(f"🔍 Found {existing_count} existing records before cleanup")

        # Store both profile and posts data together
        db_success, db_message = insert_data_to_astra(profile_data, result['posts_data'])
        
        # Verify cleanup after insertion
        final_count = verify_data_cleanup(username)
        print(f"✅ After insertion: {final_count} record exists")

        result['db_status'] = db_success
        result['db_message'] = db_message

        result['success'] = True
        print(f"✅ Successfully fetched {len(result['posts_data'])} posts")

        # Update cache
        get_cached_profile.cache_clear()
        result['cache_time'] = datetime.now()
        get_cached_profile(username)  # Cache the new result

        return result

    except Exception as e:
        print(f"❌ Error: {str(e)}")
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