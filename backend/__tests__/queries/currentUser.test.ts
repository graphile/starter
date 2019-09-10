import { setup, teardown, runGraphQLQuery, deleteTestUsers } from "../helpers";

beforeEach(deleteTestUsers);
beforeAll(setup);
afterAll(teardown);

test("currentUser", async () => {
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
    async json => {
      expect(json.errors).toBeFalsy();
      expect(json.data).toBeTruthy();
      expect(json.data!.currentUser).toBe(null);
    }
  );
});
