import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
import prisma from "../prisma";

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

async function putPfp(filename: string, pass: any) {
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

async function cleanPfp() {
  const regex = /\/pfp\/([\d\w]+\.(png|webp|jpg|jpeg))$/;
  const profiles = await prisma.profile.findMany({ select: { pfp: true } });
  const dbPfps = new Set(profiles.map((el) => el.pfp.match(regex)?.at(1)));

  const s3response = await s3client.send(
    new ListObjectsCommand({ Bucket: "pfp" }),
  );
  const s3Pfps = s3response.Contents?.map((el) => el.Key);
  if (!s3Pfps) {
    return;
  }

  const stalePfps = [];
  for (const pfp of s3Pfps) {
    if (!dbPfps.has(pfp)) {
      stalePfps.push(pfp);
    }
  }
  if (!stalePfps.length) {
    return;
  }

  await s3client.send(
    new DeleteObjectsCommand({
      Bucket: "pfp",
      Delete: {
        Objects: stalePfps.map((el) => ({
          Key: el,
        })),
      },
    }),
  );
}

export { s3client, putPfp, getPfp, cleanPfp };
