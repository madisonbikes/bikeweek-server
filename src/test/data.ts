import { testDatabase } from "./setup";

const PASSWORD_WITH_LOW_WORK_FACTOR =
  "$2y$04$lQNknVpHEe6ddO3Et1nMGe6q4lNrtNcC3ikrhshs.wT.neD7JwBbm";

export const createTestUser = async () => {
  await testDatabase().users.insertOne({
    username: "testuser",
    password: PASSWORD_WITH_LOW_WORK_FACTOR,
  });
};

export const createTestAdminUser = async () => {
  await testDatabase().users.insertOne({
    username: "testadmin",
    password: PASSWORD_WITH_LOW_WORK_FACTOR,
    admin: true,
  });
};
