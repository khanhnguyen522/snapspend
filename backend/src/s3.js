const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-2" });
const BUCKET = process.env.S3_BUCKET_NAME;

const uploadToS3 = async (buffer, key, contentType) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      KEY: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return key;
};

const deleteFromS3 = async (key) => {
  if (!key) {
    return;
  }
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {}
};

const getSignedPhotoUrl = async (key) => {
  if (!key) {
    return null;
  }
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: 3600,
  });
};

module.exports = { uploadToS3, deleteFromS3, getSignedPhotoUrl };
