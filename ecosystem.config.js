module.exports = {
  apps: [
    {
      script: "node-modules/.bin/ts-node",
      args: "src/index.ts",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    },
  ],
};
