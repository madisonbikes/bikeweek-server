ssh -t mbi "cd ~/apps/bikeweek2021_importer/app; \
            git reset --hard origin/main; \
            git pull; \
            npm i; \
            npm prune; \
            pm2 reload ecosystem.config.js"