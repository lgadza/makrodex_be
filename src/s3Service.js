import AWS from 'aws-sdk';

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