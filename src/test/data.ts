import { testDatabase } from "./setup";

const PASSWORD_WITH_LOW_WORK_FACTOR =
  "$2y$04$lQNknVpHEe6ddO3Et1nMGe6q4lNrtNcC3ikrhshs.wT.neD7JwBbm";

export const createTestUser = async () => {
  await testDatabase().users.insertOne({
    username: "testuser",
    hashed_password: PASSWORD_WITH_LOW_WORK_FACTOR,
    federated: [{ provider: "google", id: "blarg@blarg.com" }],
  });
};

export const createDuplicatedFederatedId = async () => {
  await testDatabase().users.insertOne({
    username: "testuser2",
    hashed_password: PASSWORD_WITH_LOW_WORK_FACTOR,
    federated: [{ provider: "google", id: "blarg@blarg.com" }],
  });
};

export const createTestAdminUser = async () => {
  await testDatabase().users.insertOne({
    username: "testadmin",
    hashed_password: PASSWORD_WITH_LOW_WORK_FACTOR,
    roles: ["admin"],
  });
};
