import AWS from 'aws-sdk';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


// AWS S3 Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const s3 = new AWS.S3();


export const generateSignedUrl = async (bucket, key, expiresInSeconds) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expiresInSeconds, // Time in seconds until the URL expires
    };
  
    return new Promise((resolve, reject) => {
      s3.getSignedUrl('getObject', params, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  };
  
// Initialize the S3 client
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const uploadFileToS3 = async (buffer, filename, folderName, type) => {
  const key = `${folderName}/${filename}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const uploadedFileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return uploadedFileUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

export { uploadFileToS3 };