import os
import pymongo
import base64

# Function to read file content and encode to base64
def read_file_to_base64(file_path):
    with open(file_path, 'rb') as f:
        encoded_content = base64.b64encode(f.read()).decode('utf-8')
    return encoded_content

# Function to connect to MongoDB and insert data
def insert_to_mongodb(file_collection, file_name, file_content):
    data = {
        'file_name': file_name,
        'file_content': file_content
    }
    file_collection.insert_one(data)

# Main function to process files
def process_files(directory_path):
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['Carved_Files']
    jpg_collection = db['jpg']
    jpeg_collection = db['jpeg']

    for filename in os.listdir(directory_path):
        if filename.lower().endswith(('.jpg', '.jpeg')):
            file_path = os.path.join(directory_path, filename)
            file_content = read_file_to_base64(file_path)
            if filename.lower().endswith('.jpg'):
                insert_to_mongodb(jpg_collection, filename, file_content)
            elif filename.lower().endswith('.jpeg'):
                insert_to_mongodb(jpeg_collection, filename, file_content)

    client.close()
    print("Files inserted into MongoDB successfully.")

# Example usage
if __name__ == "__main__":
    directory_path = 'C:/Users/hp/Desktop/timeline-views-test-this-pls/timeline-views-test-this-pls/flask-backend/pics'  # Replace with your directory path
    process_files(directory_path)

