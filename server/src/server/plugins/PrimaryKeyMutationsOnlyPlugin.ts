/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import { Plugin } from "graphile-build";

type PgConstraint = any;

const PrimaryKeyMutationsOnlyPlugin: Plugin = builder => {
  builder.hook(
    "build",
    build => {
      build.pgIntrospectionResultsByKind.constraint.forEach(
        (constraint: PgConstraint) => {
          if (!constraint.tags.omit && constraint.type !== "p") {
            constraint.tags.omit = ["update", "delete"];
          }
        }
      );
      return build;
    },
    [],
    [],
    ["PgIntrospection"]
  );
};

export default PrimaryKeyMutationsOnlyPlugin;
