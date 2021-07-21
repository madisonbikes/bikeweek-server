# simple deploy script, adjust accordingly
HOSTNAME=mbi

# cloned git repo path, will
REPO_PATH="~/apps/bikeweek2021_importer/app"

# git branch to use
GIT_BRANCH=origin/main

# resets git branch and pulls new code, install/removes packages as necessary and reloads the pm2 process
ssh -t $HOSTNAME "\
            cd $REPO_PATH; \
            git reset --hard $GIT_BRANCH; \
            git pull; \
            npm i; \
            npm prune; \
            pm2 reload ecosystem.config.js"