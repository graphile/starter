it(
  "can add an email (unverified), receive code, verify email (and marks account as verified)"
);
it("cannot manually create a verified email");
it("cannot manually mark an email as verified");
it("can promote a verified email to primary over another verified email");
it("can promote a verified email to primary over an unverified email");
it("cannot promote a non-verified email to primary");
it("cannot see other user's emails (verified or otherwise)");
