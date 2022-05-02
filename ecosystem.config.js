module.exports = {
  apps: [
    {
      name: "bikeweek-server",
      script: "node_modules/.bin/ts-node",
      args: "src/index.ts",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    },
  ],
};
