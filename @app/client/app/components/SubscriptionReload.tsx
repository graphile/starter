import type { OperationVariables } from "@apollo/client";
import { useSubscription } from "@apollo/client";
import type { DocumentNode } from "graphql";
import { ClientOnly, useDataRefresh } from "remix-utils";

interface Props {
  query: DocumentNode;
  variables?: OperationVariables;
}

function SubscriptionReloadInternal({ query, variables }: Props) {
  let { refresh } = useDataRefresh();
  useSubscription(query, {
    variables,
    onSubscriptionData: () => {
      refresh();
    },
  });
  return null;
}

export function SubscriptionReload(props: Props) {
  return (
    <ClientOnly>{() => <SubscriptionReloadInternal {...props} />}</ClientOnly>
  );
}
