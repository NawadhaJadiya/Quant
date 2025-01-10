from astrapy import DataAPIClient
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize the client
client = DataAPIClient(os.getenv("ASTRAPY_API_TOKEN"))
db = client.get_database_by_api_endpoint(
    os.getenv("ASTRAPY_API_ENDPOINT")
)

# Get list of collections
collections = db.list_collection_names()
print(f"Available collections: {collections}")

instagram_collection = db.get_collection("instagram_data")
print(f"\nAccessed collection: instagram_data")

def print_collection_data():
    instagram_collection = db.get_collection("instagram_data")
    
    # Find all documents
    documents = instagram_collection.find({})
    print("\nStored Instagram Data:")
    
    for doc in documents:
        print(f"\n{'='*50}")
        print(f"Username: {doc['username']}")
        
        # Print profile data
        profile = doc['profile_data']
        print(f"\nProfile:")
        print(f"  Full Name: {profile['full_name']}")
        print(f"  Followers: {profile['followers_count']:,}")
        print(f"  Following: {profile['following_count']:,}")
        print(f"  Total Posts: {profile['total_posts']:,}")
        
        # Print posts summary
        posts = doc['posts']
        print(f"\nPosts ({len(posts)} total):")
        for post_key, post in posts.items():
            print(f"\n  {post_key}:")
            print(f"    Type: {post['post_type']}")
            print(f"    Likes: {post['likes']:,}")
            print(f"    Comments: {post['comments']:,}")
            print(f"    Posted: {post['timestamp']}")
        
        print(f"\nLast Updated: {doc['last_updated']}")
        print('='*50)

if __name__ == "__main__":
    print_collection_data()