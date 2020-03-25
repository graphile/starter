import {
  createUserAndLogIn,
  deleteTestUsers,
  runGraphQLQuery,
  setup,
  teardown,
} from "../helpers";

beforeEach(deleteTestUsers);
beforeAll(setup);
afterAll(teardown);

test("currentUser when logged out", async () => {
  await runGraphQLQuery(
    // GraphQL query goes here:
    `{currentUser{id}}`,

    // GraphQL variables:
    {},

    // Additional props to add to `req` (e.g. `user: {session_id: '...'}`)
    {
      user: null,
    },

    // This function runs all your test assertions:
    async (json) => {
      expect(json.errors).toBeFalsy();
      expect(json.data).toBeTruthy();
      expect(json.data!.currentUser).toBe(null);
    }
  );
});

test("currentUser when logged in", async () => {
  const { user, session } = await createUserAndLogIn();
  await runGraphQLQuery(
    // GraphQL query goes here:
    `{currentUser{id}}`,

    // GraphQL variables:
    {},

    // Additional props to add to `req` (e.g. `user: {session_id: '...'}`)
    {
      user: { session_id: session.uuid },
    },

    // This function runs all your test assertions:
    async (json) => {
      expect(json.errors).toBeFalsy();
      expect(json.data).toBeTruthy();
      expect(json.data!.currentUser).toMatchObject({
        id: user.id,
      });
    }
  );
});
