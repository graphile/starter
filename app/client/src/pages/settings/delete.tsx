import React, { useCallback, useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";
import { H3, P } from "../../components/Text";
import { Alert, Button, Modal, Typography } from "antd";
import ErrorAlert from "../../components/ErrorAlert";
import { ApolloError } from "apollo-client";
import {
  useRequestAccountDeletionMutation,
  useConfirmAccountDeletionMutation,
} from "../../graphql";
import { useRouter } from "next/router";

const { Text } = Typography;

export default function Settings_Accounts() {
  const router = useRouter();
  const token: string | null =
    (router && router.query && !Array.isArray(router.query.token)
      ? router.query.token
      : null) || null;
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
  return (
    <SettingsLayout href="/settings/delete">
      <H3>Delete Account</H3>
      <P>
        Deleting your user account will delete all data (except that which we
        must retain for legal, compliance and accounting reasons) and cannot be
        undone. Make sure you want to do this.
      </P>
      <P>
        To protect your account, we require you to confirm you wish to delete
        your account here, then you will be sent an email with a confirmation
        code (to check your identity) and when you click that link you will be
        asked to confirm your account deletion again.
      </P>
      {token ? (
        <Alert
          type="error"
          message="Confirm account deletion"
          description={
            <>
              <P>
                This is it.{" "}
                <Text mark>
                  Press this button and your account will be deleted.
                </Text>{" "}
                We're sorry to see you go, please don't hesitate to reach out
                and let us know why you no longer want your account.
              </P>
              <Button
                onClick={confirmDeletion}
                type="danger"
                disabled={deleting}
              >
                PERMANENTLY DELETE MY ACCOUNT
              </Button>
            </>
          }
        />
      ) : itIsDone ? (
        <Alert
          type="warning"
          message="Confirm deletion via email link"
          description={
            <P>
              You've been sent an email with a confirmation link in it, you must
              click it to confirm that you are the account holder so that you
              may continue deleting your account.
            </P>
          }
        />
      ) : (
        <Alert
          type="error"
          message="Delete user account?"
          description={
            <>
              <P>
                Deleting your account cannot be undone, you will lose all your
                data.
              </P>
              <Button onClick={openModal} type="danger">
                I want to delete my account
              </Button>
            </>
          }
        />
      )}
      {error ? <ErrorAlert error={error} /> : null}
      <Modal
        visible={confirmOpen}
        onCancel={closeModal}
        onOk={doIt}
        okText="Send delete account email"
        okType="danger"
        title="Send delete account confirmation email?"
        confirmLoading={doingIt}
      >
        <P>
          Before we can delete your account, we need to confirm it's definitely
          you. We'll send you an email with a link in it, which when clicked
          will give you the option to delete your account.
        </P>
        <P>
          You should not trigger this unless you're sure you want to delete your
          account.
        </P>
      </Modal>
      <Modal
        visible={deleted}
        closable={false}
        title="Account deleted"
        footer={
          <div>
            <Button
              type="primary"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Return to homepage
            </Button>
          </div>
        }
      >
        Your account has been successfully deleted. We wish you all the best.
      </Modal>
    </SettingsLayout>
  );
}
