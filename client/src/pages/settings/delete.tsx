import React, { useCallback, useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";
import { H3, P } from "../../components/Text";
import { Alert, Button, Modal } from "antd";
import ErrorAlert from "../../components/ErrorAlert";
import { ApolloError } from "apollo-client";

export default function Settings_Accounts() {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itIsDone, setItIsDone] = useState(false);
  const [doingIt, setDoingIt] = useState(false);
  const openModal = useCallback(() => setConfirmOpen(true), []);
  const closeModal = useCallback(() => setConfirmOpen(false), []);
  const doIt = useCallback(() => {
    setDoingIt(true);
    (async () => {
      try {
        // await ...
        setItIsDone(true);
      } catch (e) {
        setError(e);
      }
      setDoingIt(false);
      setConfirmOpen(false);
    })();
  }, []);
  return (
    <SettingsLayout href="/settings/accounts">
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
      {itIsDone ? (
        <Alert
          type="warning"
          message="Deletion initiated, please confirm via email"
          description={
            <P>
              You've been sent an email with a confirmation link in it, you must
              click it to continue deleting your account.
            </P>
          }
        />
      ) : (
        <Alert
          type="error"
          message="Delete user account?!"
          description={
            <>
              <P>This action (once complete) cannot be undone!</P>
              <Button onClick={openModal} type="danger">
                INITIATE ACCOUNT DELETION PROCEDURE
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
        <P>All your account data will be lost... are you sure?</P>
      </Modal>
    </SettingsLayout>
  );
}
