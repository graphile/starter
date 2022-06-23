declare module "*.graphql" {
  import type { DocumentNode } from "graphql";
  const Schema: DocumentNode;

  export = Schema;
}
