const fs = require('fs');
const {
  ObjectStorageClient,
  ListBucketsCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('./sdk/sdk');

async function main() {
  // Initialize the client
  const client = new ObjectStorageClient({
    endpoint: 'https://api.objectstorage.com',
    credentials: {
      accessKeyId: 'your-access-key-id',
      secretAccessKey: 'your-secret-access-key'
    }
  });

  try {
    // List buckets
    console.log('Listing buckets:');
    const listBucketsResult = await client.send(new ListBucketsCommand());
    console.log(listBucketsResult);

    // Upload an object
    const bucketName = 'my-bucket';
    const objectKey = 'example.txt';
    const objectContent = 'Hello, Object Storage!';
    
    console.log(`Uploading object ${objectKey} to bucket ${bucketName}`);
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: objectContent,
      ContentType: 'text/plain'
    }));

    // Get the uploaded object
    console.log(`Retrieving object ${objectKey} from bucket ${bucketName}`);
    const getObjectResult = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey
    }));
    console.log('Retrieved object content:', Buffer.from(getObjectResult).toString('utf-8'));

    // Delete the object
    console.log(`Deleting object ${objectKey} from bucket ${bucketName}`);
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey
    }));
    console.log('Object deleted successfully');

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();
