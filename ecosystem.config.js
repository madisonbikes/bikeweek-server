module.exports = {
  apps: [
    {
      name: "bikeweek2021-importer",
      script: "node-modules/.bin/ts-node",
      args: "src/index.ts",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    },
  ],
};
