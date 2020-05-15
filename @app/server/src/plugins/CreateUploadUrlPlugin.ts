import * as aws from "aws-sdk";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

import { OurGraphQLContext } from "../middleware/installPostGraphile";

const awsRegion = process.env.AWS_REGION || "us-east-1";
const uploadBucket = process.env.S3_UPLOADS_BUCKET;

const s3 = new aws.S3({
  region: awsRegion,
  signatureVersion: "v4",
});

interface CreateUploadUrlInput {
  clientMutationId?: string;
  contentType: string;
}

/** The minimal set of information that this plugin needs to know about users. */
interface User {
  id: string;
  isVerified: boolean;
}

async function getCurrentUser(pool: Pool): Promise<User | null> {
  await pool.query("SAVEPOINT");
  try {
    const {
      rows: [row],
    } = await pool.query(
      "select id, is_verified from app_public.users where id = app_public.current_user_id()"
    );
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      isVerified: row.is_verified,
    };
  } catch (err) {
    await pool.query("ROLLBACK TO SAVEPOINT");
    throw err;
  } finally {
    await pool.query("RELEASE SAVEPOINT");
  }
}
/** The set of content types that we allow users to upload.*/
const ALLOWED_UPLOAD_CONTENT_TYPES = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
];

const CreateUploadUrlPlugin = makeExtendSchemaPlugin(() => ({
  typeDefs: gql`
    """
    All input for the \`createUploadUrl\` mutation.
    """
    input CreateUploadUrlInput @scope(isMutationInput: true) {
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
      contentType: String!
    }

    """
    The output of our \`createUploadUrl\` mutation.
    """
    type CreateUploadUrlPayload @scope(isMutationPayload: true) {
      """
      The exact same \`clientMutationId\` that was provided in the mutation input,
      unchanged and unused. May be used by a client to track mutations.
      """
      clientMutationId: String

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
        if (!uploadBucket) {
          const err = new Error(
            "Server misconfigured: missing `S3_UPLOADS_BUCKET` envvar"
          );
          // @ts-ignore
          err.code = "MSCFG";
          throw err;
        }

        const user = await getCurrentUser(context.rootPgPool);

        if (!user) {
          const err = new Error("Login required");
          // @ts-ignore
          err.code = "LOGIN";
          throw err;
        }

        if (!user.isVerified) {
          const err = new Error("Only verified users may upload files");
          // @ts-ignore
          err.code = "DNIED";
          throw err;
        }

        const {
          input: { contentType, clientMutationId },
        } = args;
        if (!ALLOWED_UPLOAD_CONTENT_TYPES.includes(contentType)) {
          throw new Error(
            `Not allowed to upload that type; allowed types include: '${ALLOWED_UPLOAD_CONTENT_TYPES.join(
              "', '"
            )}'`
          );
        }
        const params = {
          Bucket: uploadBucket,
          ContentType: contentType,
          // randomly generated filename, nested under username directory
          Key: `avatars/${user.id}/${uuidv4()}`,
          Expires: 300, // signed URL will expire in 5 minutes
          ACL: "public-read", // uploaded file will be publicly readable
        };
        const signedUrl = await s3.getSignedUrlPromise("putObject", params);
        return {
          clientMutationId,
          uploadUrl: signedUrl,
        };
      },
    },
  },
}));

export default CreateUploadUrlPlugin;
