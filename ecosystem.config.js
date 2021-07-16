module.exports = {
  apps: [
    {
      script: "./index.js",
    },
  ],

  deploy: {
    production: {
      user: "madisonbikes",
      host: "mbi",
      ref: "origin/master",
      repo: "https://github.com/madisonbikes/bikeweek2021-importer",
      path: "/home/madisonbikes/apps/bikeweek2021_importer/repo",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env prod",
      "pre-setup": "",
    },
  },
};
