import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SignedUrlResponseDto } from "../dtos/signedUrl.dtos";


const getS3Client = () => {

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    console.error("FATAL ERROR: AWS Credentials or Region are missing in environment variables.");
    throw new Error("Missing AWS configuration for S3 client.");
  }
  return new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
};
export const generateUploadSignedUrl = async (
  fileName: string,
  fileType: string
): Promise<SignedUrlResponseDto> => {
  const s3 = getS3Client();

  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is not set.");
  }

  const key = `project-images/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  }); 

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
  } catch (error) {
    console.error("S3 Generate Signed URL failed:", error);
    throw error; 
  }
};

export const getFileUrl = (key: string): string => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

export const generateReadSignedUrl = async (key: string): Promise<string> => {
  const s3 = getS3Client();
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is not set.");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    // 60-second signature for rapid redirection
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return signedUrl;
  } catch (error) {
    console.error("S3 Generate Read Signed URL failed:", error);
    throw error;
  }
};
