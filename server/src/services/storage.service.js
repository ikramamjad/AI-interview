const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const isS3Configured = Boolean(
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY &&
  process.env.S3_SECRET_KEY
);

let s3Client = null;
if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  });
}

/**
 * Save file to S3 or local fallback
 * @param {Object} file Express Multer file object
 * @returns {Promise<string>} Accessible file URL
 */
async function saveFile(file) {
  const fileExt = path.extname(file.originalname);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;

  if (isS3Configured && s3Client) {
    const key = `resumes/${uniqueName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: "AES256", // TRD Requirement: Encrypt resumes at rest
    });

    await s3Client.send(command);
    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
  }

  // Local storage fallback for local development
  const filePath = path.join(uploadsDir, uniqueName);
  fs.writeFileSync(filePath, file.buffer);
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${uniqueName}`;
}

module.exports = {
  saveFile,
  uploadsDir,
  isS3Configured,
};
