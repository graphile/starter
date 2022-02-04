import { ApolloError } from "@apollo/client";
import {
  ErrorAlert,
  PageHeader,
  SettingsLayout,
} from "@app/client/src/components";
import { PageContext } from "@app/client/src/renderer/types";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import {
  useConfirmAccountDeletionMutation,
  useRequestAccountDeletionMutation,
  useSharedQuery,
} from "@app/graphql";
import { getCodeFromError } from "@app/lib";
import { Alert, Button, Divider, Mark, Modal, Text } from "@mantine/core";
import React, { useCallback, useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { PageContextBuiltInClient } from "vite-plugin-ssr/client/router/index";

export { Page };

const Page: React.FC = () => {
  const {
    urlParsed: {
      // @ts-ignore
      search: { token },
    },
  } = usePageContext() as Partial<
    PageContextBuiltInClient &
      PageContext & { urlParsed: { search: Record<string, string> } }
  >;
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itIsDone, setItIsDone] = useState(false);
  const [doingIt, setDoingIt] = useState(false);
  const openModal = useCallback(() => setConfirmOpen(true), []);
  const closeModal = useCallback(() => setConfirmOpen(false), []);
  const [requestAccountDeletion] = useRequestAccountDeletionMutation();

  const doIt = useCallback(() => {
    setError(null);
    setDoingIt(true);
    (async () => {
      try {
        const result = await requestAccountDeletion();
        if (!result) {
          throw new Error("Result expected");
        }
        const { data, errors } = result;
        if (
          !data ||
          !data.requestAccountDeletion ||
          !data.requestAccountDeletion.success
        ) {
          console.dir(errors);
          throw new Error("Requesting deletion failed");
        }
        setItIsDone(true);
      } catch (e) {
        setError(e);
      }
      setDoingIt(false);
      setConfirmOpen(false);
    })();
  }, [requestAccountDeletion]);

  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmAccountDeletion] = useConfirmAccountDeletionMutation();
  const confirmDeletion = useCallback(() => {
    if (deleting || !token) {
      return;
    }
    setError(null);
    setDeleting(true);
    (async () => {
      try {
        await confirmAccountDeletion({ variables: { token } });
        // Display confirmation
        setDeleted(true);
      } catch (e) {
        setError(e);
      }
      setDeleting(false);
    })();
  }, [confirmAccountDeletion, deleting, token]);

  const query = useSharedQuery();

  return (
    <SettingsLayout href="/settings/delete" query={query}>
      <PageHeader title="Delete account" />
      <Text>
        Deleting your user account will delete all data (except that which we
        must retain for legal, compliance and accounting reasons) and cannot be
        undone. Make sure you want to do this.
      </Text>
      <Text>
        To protect your account, we require you to confirm you wish to delete
        your account here, then you will be sent an email with a confirmation
        code (to check your identity) and when you click that link you will be
        asked to confirm your account deletion again.
      </Text>

      {token ? (
        <Alert color={"red"} title="Confirm account deletion">
          <>
            <Text>
              This is it.{" "}
              <Mark>Press this button and your account will be deleted.</Mark>{" "}
              We're sorry to see you go, please don't hesitate to reach out and
              let us know why you no longer want your account.
            </Text>
            <Button color="red" onClick={confirmDeletion} disabled={deleting}>
              PERMANENTLY DELETE MY ACCOUNT
            </Button>
          </>
        </Alert>
      ) : itIsDone ? (
        <Alert color={"orange"} title="Confirm deletion via email link">
          <Text>
            You've been sent an email with a confirmation link in it, you must
            click it to confirm that you are the account holder so that you may
            continue deleting your account.
          </Text>
        </Alert>
      ) : (
        <Alert color={"red"} title="Delete user account?">
          <>
            <Text style={{ marginBottom: "1rem" }}>
              Deleting your account cannot be undone, you will lose all your
              data.
            </Text>
            <Button onClick={openModal} color={"red"} variant={"outline"}>
              I want to delete my account
            </Button>
          </>
        </Alert>
      )}
      {error ? (
        getCodeFromError(error) === "OWNER" ? (
          <Alert
            color={"red"}
            icon={<AiOutlineCloseCircle />}
            title="Cannot delete account"
          >
            <>
              <Text>
                You cannot delete your account whilst you are the owner of an
                organization.
              </Text>
              <Text>
                For each organization you are the owner of, please either assign
                your ownership to another user or delete the organization to
                continue.
              </Text>
            </>
          </Alert>
        ) : (
          <ErrorAlert error={error} />
        )
      ) : null}
      <Modal
        opened={confirmOpen}
        onClose={closeModal}
        title="Send delete account confirmation email?"
      >
        <Text>
          Before we can delete your account, we need to confirm it's definitely
          you. We'll send you an email with a link in it, which when clicked
          will give you the option to delete your account.
        </Text>
        <Text>
          You should not trigger this unless you're sure you want to delete your
          account.
        </Text>
        <Divider />
        <Button color={"red"} variant={"outline"} onClick={doIt}>
          Send delete account email
        </Button>
        <Button variant={"subtle"} onClick={closeModal}>
          Cancel
        </Button>
      </Modal>
      <Modal
        opened={deleted}
        title="Account deleted"
        onClose={() => {}}
        hideCloseButton
      >
        <Text>
          Your account has been successfully deleted. We wish you all the best.
        </Text>
        <Divider />
        <Button
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Return to homepage
        </Button>
      </Modal>
    </SettingsLayout>
  );
};
