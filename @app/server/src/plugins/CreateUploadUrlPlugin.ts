import { awsRegion, uploadBucket } from "@app/config";
import * as aws from "aws-sdk";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import uuidv4 from "uuid/v4";

import { OurGraphQLContext } from "../middleware/installPostGraphile";

enum AllowedUploadContentType {
  IMAGE_APNG = "image/apng",
  IMAGE_BMP = "image/bmp",
  IMAGE_GIF = "image/gif",
  IMAGE_JPEG = "image/jpeg",
  IMAGE_PNG = "image/png",
  IMAGE_SVG_XML = "image/svg+xml",
  IMAGE_TIFF = "image/tiff",
  IMAGE_WEBP = "image/webp",
}

interface CreateUploadUrlInput {
  clientMutationId?: string;
  contentType: AllowedUploadContentType;
}

const CreateUploadUrlPlugin = makeExtendSchemaPlugin(() => ({
  typeDefs: gql`
    """
    The set of content types that we allow users to upload.
    """
    enum AllowedUploadContentType {
      "image/apng"
      IMAGE_APNG
      "image/bmp"
      IMAGE_BMP
      "image/gif"
      IMAGE_GIF
      "image/jpeg"
      IMAGE_JPEG
      "image/png"
      IMAGE_PNG
      "image/svg+xml"
      IMAGE_SVG_XML
      "image/tiff"
      IMAGE_TIFF
      "image/webp"
      IMAGE_WEBP
    }

    """
    All input for the \`createUploadUrl\` mutation.
    """
    input CreateUploadUrlInput {
      """
      An arbitrary string value with no semantic meaning. Will be included in the
      payload verbatim. May be used to track mutations by the client.
      """
      clientMutationId: String
      """
      You must provide the content type (or MIME type) of the content you intend
      to upload. For further information about content types, see
      https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
      """
      contentType: AllowedUploadContentType!
    }

    """
    The output of our \`createUploadUrl mutation.
    """
    type CreateUploadUrlPayload {
      """
      The exact same \`clientMutationId\` that was provided in the mutation input,
      unchanged and unused. May be used by a client to track mutations.
      """
      clientMutationId: String

      """
      Our root query field type. Allows us to run any query from our mutation payload.
      """
      query: Query
      """
      Upload content to this signed URL.
      """
      uploadUrl: String!
    }

    extend type Mutation {
      """
      Get a signed URL for uploading files. It will expire in 5 minutes.
      """
      createUploadUrl(
        """
        The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
        """
        input: CreateUploadUrlInput!
      ): CreateUploadUrlPayload
    }
  `,
  resolvers: {
    Mutation: {
      async createUploadUrl(
        _query,
        args: { input: CreateUploadUrlInput },
        context: OurGraphQLContext,
        _resolveInfo
      ) {
        const { rootPgPool } = context;
        const { input } = args;
        const {
          rows: [user],
        } = await rootPgPool.query(
          `select username from app_public.users where id = app_public.current_user_id()`
        );
        const username: string = user.username;

        const contentType: string = AllowedUploadContentType[input.contentType];
        const s3 = new aws.S3({
          region: awsRegion,
          signatureVersion: "v4",
        });
        const params = {
          Bucket: uploadBucket,
          ContentType: contentType,
          // randomly generated filename, nested under username directory
          Key: `${username}/${uuidv4()}`,
          Expires: 300, // signed URL will expire in 5 minutes
          ACL: "public-read", // uploaded file will be publicly readable
        };
        const signedUrl = await s3.getSignedUrlPromise("putObject", params);
        return {
          clientMutationId: input.clientMutationId,
          uploadUrl: signedUrl,
        };
      },
    },
  },
}));

export default CreateUploadUrlPlugin;
