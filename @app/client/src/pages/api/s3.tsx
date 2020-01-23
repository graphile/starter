import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const bucket = serverRuntimeConfig.BUCKET;
  const key = req.query.key;
  const params: AWS.S3.PutObjectRequest = {
    Bucket: bucket,
    Key: key as string,
  };
  const client = getClient();
  const operation = req.query.operation;
  if (operation === "put") {
    put(client, params);
  } else if (operation === "delete") {
    del(client, params);
  }

  function getClient() {
    const region = serverRuntimeConfig.AWS_REGION;
    const accessKey = serverRuntimeConfig.AWSACCESSKEYID;
    const secretKey = serverRuntimeConfig.AWSSECRETKEY;
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      signatureVersion: "v4",
      region: region,
    });
    const options = {
      signatureVersion: "v4",
      region: region,
      // uncomment to use accelerated endpoint
      // accelerated endpoint must be turned on in your s3 bucket first
      // endpoint: new AWS.Endpoint(
      //   "bucket.s3-accelerate.amazonaws.com"
      // ),
      // useAccelerateEndpoint: true,
    };
    const client = new AWS.S3(options);
    return client;
  }
  function put(client: AWS.S3, params: AWS.S3.PutObjectRequest) {
    const putParams = {
      ...params,
      Expires: 5 * 60,
    };

    client.getSignedUrl("putObject", putParams, (err, url) => {
      if (err) {
        res.json({ success: false, err });
      } else {
        res.json({ success: true, url });
      }
    });
  }
  function del(client: AWS.S3, params: AWS.S3.DeleteObjectRequest) {
    client.deleteObject(params, err => {
      if (err) {
        res.json({ success: false, err });
      } else {
        res.json({ success: true });
      }
    });
  }
};
