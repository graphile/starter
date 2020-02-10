import { Express, Router } from "express";
import uuidv4 from "uuid/v4";
import * as aws from "aws-sdk";
import {
  awsRegion,
  uploadBucket,
  uploadBucketPublicUrlPrefix,
} from "@app/config";

interface Options {
  preserveFileName?: boolean;
  prefix?: string;
}

function makeUploadRouter({ preserveFileName, prefix }: Options = {}) {
  const router = Router();
  router.get("/signedUrl", async (req, res) => {
    const contentType = req.query.contentType
      ? String(req.query.contentType)
      : undefined;
    const fileName =
      req.query.fileName && preserveFileName
        ? String(req.query.fileName)
        : uuidv4();
    const fileKey = prefix ? prefix + fileName : fileName;
    const publicUrlPrefix =
      uploadBucketPublicUrlPrefix ||
      `https://${uploadBucket}.s3.amazonaws.com/`;
    const s3 = new aws.S3({
      region: awsRegion,
      signatureVersion: "v4",
    });
    const params = {
      Bucket: uploadBucket,
      Key: fileKey,
      ContentType: contentType,
      Expires: 60, // signed URL will expire in 60 seconds
      ACL: "public-read", // uploaded file will be publicly readable
    };
    try {
      const signedUrl = await s3.getSignedUrlPromise("putObject", params);
      return res.json({
        signedUrl,
        publicUrl: publicUrlPrefix + fileKey,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send("Cannot create S3 signed URL");
    }
  });
  return router;
}

export default async function installUploadRouter(app: Express) {
  const router = makeUploadRouter({ preserveFileName: true });
  app.use("/upload", router);
}
