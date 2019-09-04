it.todo(
  "can add an email (unverified), receive code, verify email (and marks account as verified)"
);
it.todo("cannot manually create a verified email");
it.todo("cannot manually mark an email as verified");
it.todo("can promote a verified email to primary over another verified email");
it.todo("can promote a verified email to primary over an unverified email");
it.todo("cannot promote a non-verified email to primary");
it.todo("cannot see other user's emails (verified or otherwise)");
