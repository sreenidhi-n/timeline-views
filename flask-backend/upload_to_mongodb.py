import os
import base64
import pymongo
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import fractions

# MongoDB connection settings
MONGO_URI = 'mongodb://localhost:27017/'
client = pymongo.MongoClient(MONGO_URI)
db = client["image_database"]
collection_with_data = db["images_with_data"]
collection_without_data = db["images_without_data"]

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

from PIL import Image, ExifTags, ImageOps

def get_exif_data(image_path):
    try:
        image = Image.open(image_path)
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
        print(f"Error extracting EXIF data from {image_path}: {e}")
        return None

def has_datetime(exif):
    if 'DateTime' in exif:
        return True
    return False

def has_location(exif):
    if 'GPSInfo' in exif:
        return True
    return False

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string

def upload_images_from_directory(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".jpg") or filename.endswith(".jpeg") or filename.endswith(".png"):
            image_path = os.path.join(directory, filename)
            encoded_image = encode_image_to_base64(image_path)
            exif_data = get_exif_data(image_path)
            
            # Determine which collection to insert into
            if exif_data is None or (not has_datetime(exif_data) and not has_location(exif_data)):
                collection = collection_without_data
            else:
                collection = collection_with_data
            
            # Prepare the document to be inserted
            document = {
                "file_name": filename,
                "file_content": encoded_image,
                "exif_data": exif_data  # Store the full EXIF data
            }
            
            # Insert the document into the appropriate collection
            try:
                result = collection.insert_one(document)
                print(f"Image '{filename}' uploaded to '{collection.name}' with ID: {result.inserted_id}")
            except Exception as e:
                print(f"Error inserting image '{filename}' into '{collection.name}': {e}")

if __name__ == "__main__":
    directory_path = "E:/CID-internship/sree/flask-backend/pics"
    upload_images_from_directory(directory_path)
