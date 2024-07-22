import pymongo
import base64
from PIL import Image, ExifTags
import fractions
import io

# MongoDB connection settings
SOURCE_MONGO_URI = 'mongodb://localhost:27017/Carved_Files'
DEST_MONGO_URI = 'mongodb://localhost:27017/image_database'

# Connect to source and destination MongoDB
source_client = pymongo.MongoClient(SOURCE_MONGO_URI)
source_db = source_client.get_database()
dest_client = pymongo.MongoClient(DEST_MONGO_URI)
dest_db = dest_client.get_database()

def convert_to_str(value):
    if isinstance(value, bytes):
        return value.decode('utf-8', errors='ignore')
    elif isinstance(value, dict):
        return {str(k): convert_to_str(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [convert_to_str(item) for item in value]
    elif isinstance(value, fractions.Fraction):
        return float(value)
    elif isinstance(value, tuple) and len(value) == 2 and isinstance(value[0], int) and isinstance(value[1], int):
        # Handle IFDRational types (tuple of two integers)
        return value[0] / value[1]
    else:
        return value

def get_exif_data(image_doc):
    try:
        encoded_image = image_doc["file_content"]
        image_data = base64.b64decode(encoded_image)
        image = Image.open(io.BytesIO(image_data))
        exif_data = image._getexif()
        if exif_data is None:
            return None
        exif = {}
        for tag, value in exif_data.items():
            tag_name = ExifTags.TAGS.get(tag, tag)
            try:
                if isinstance(value, tuple) and len(value) == 2 and isinstance(value[0], int) and isinstance(value[1], int):
                    # Handle IFDRational values
                    if value[1] != 0:
                        value = float(value[0]) / float(value[1])
                    else:
                        value = None  # Handle division by zero gracefully
                exif[str(tag_name)] = str(value)
            except Exception as e:
                print(f"Error converting tag {tag_name}: {e}")
                exif[str(tag_name)] = None
        return exif
    except Exception as e:
        print(f"Error extracting EXIF data: {e}")
        return None

def has_datetime(exif):
    if 'DateTime' in exif:
        return True
    return False

def has_location(exif):
    if 'GPSInfo' in exif:
        return True
    return False

def migrate_images_from_collection(source_collection_name):
    try:
        # Check if the collection exists
        if source_collection_name not in source_db.list_collection_names():
            print(f"Collection '{source_collection_name}' does not exist in the source database.")
            return
        
        source_collection = source_db[source_collection_name]
        images = source_collection.find({})
        
        for image_doc in images:
            # Extract EXIF data
            exif_data = get_exif_data(image_doc)
            
            # Determine destination collection
            if exif_data is None or (not has_datetime(exif_data) and not has_location(exif_data)):
                dest_collection = dest_db["images_without_data"]
            else:
                dest_collection = dest_db["images_with_data"]
            
            # Update document with EXIF data
            image_doc["exif_data"] = exif_data
            
            # Insert document into destination collection
            result = dest_collection.insert_one(image_doc)
            print(f"Image '{image_doc['file_name']}' migrated to '{dest_collection.name}' with ID: {result.inserted_id}")
    
    except Exception as e:
        print(f"Error migrating images from collection '{source_collection_name}': {e}")

if __name__ == "__main__":
    # List of collections to migrate from Carved_Files
    collections_to_migrate = ['jpeg', 'jpg', 'ico', 'raw', 'tiff', 'png', 'tif', 'bmp']
    collections_to_migrate = source_db.list_collection_names()
    print(type(collections_to_migrate[0]))
    
    for collection_name in collections_to_migrate:
        migrate_images_from_collection(collection_name)

# Close MongoDB connections
source_client.close()
dest_client.close()
