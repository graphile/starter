import React from "react";
import SettingsLayout from "../../components/SettingsLayout";
import Link from "next/link";

export default function Settings_Emails(props) {
  console.log(props);
  return <SettingsLayout href="/settings/emails">Manage emails</SettingsLayout>;
}
Settings_Emails.getInitialProps = SettingsLayout.getInitialProps;
