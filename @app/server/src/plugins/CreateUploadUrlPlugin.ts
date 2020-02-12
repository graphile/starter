import { awsRegion, uploadBucket } from "@app/config";
import * as aws from "aws-sdk";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import uuidv4 from "uuid/v4";

const CreateUploadUrlPlugin = makeExtendSchemaPlugin(() => ({
  typeDefs: gql`
    extend type Mutation {
      """
      Get a signed URL for uploading files. It will expire in 60 seconds.
      """
      createUploadUrl(contentType: String): String!
    }
  `,
  resolvers: {
    Mutation: {
      async createUploadUrl(_query, args, _context, _resolveInfo) {
        const { contentType } = args;
        const s3 = new aws.S3({
          region: awsRegion,
          signatureVersion: "v4",
        });
        const params = {
          Bucket: uploadBucket,
          ContentType: contentType,
          Key: uuidv4(), // randomly generated file name
          Expires: 60, // signed URL will expire in 60 seconds
          ACL: "public-read", // uploaded file will be publicly readable
        };
        const signedUrl = await s3.getSignedUrlPromise("putObject", params);
        return signedUrl;
      },
    },
  },
}));

export default CreateUploadUrlPlugin;
