import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
import { PassThrough } from "nodemailer/lib/xoauth2";

dotenv.config();
const s3client = new S3Client({
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY ?? "",
    secretAccessKey: process.env.BUCKET_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
  endpoint: process.env.BUCKET_ENDPOINT ?? "http://localhost:9000",
  region: process.env.BUCKET_REGION ?? "workaround",
});

async function putPfp(filename: string, pass: PassThrough) {
  await new Upload({
    client: s3client,
    params: {
      Bucket: "pfp",
      Key: filename,
      Body: pass,
    },
  }).done();
}

async function getPfp(key: string) {
  const s3response = await s3client.send(
    new GetObjectCommand({
      Bucket: "pfp",
      Key: key,
    }),
  );

  return {
    byteArray: await s3response.Body?.transformToByteArray(),
    contentType: s3response.ContentType,
  };
}

export { s3client, putPfp, getPfp };
