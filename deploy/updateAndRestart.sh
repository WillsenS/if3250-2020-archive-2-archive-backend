#!/bin/bash

set -e

# Delete the old repository folder
sudo su
rm -rf /home/ubuntu/archive-backend/

# Clone the github repository staging branch (usually develop)
cd /home/ubuntu/
git clone -b task-9/ci-cd --single-branch git@gitlab.informatika.org:if3250-2020-archive-2/archive-backend.git

# Create .env variables
cd /home/ubuntu/archive-backend/
echo MONGODB_URI=$MONGODB_URI >> .env
echo BASE_URL=$BASE_URL >> .env
echo SESSION_SECRET=$SESSION_SECRET >> .env

# Stop the previous pm2
# echo "Killing previous pm2 and removing pm2..."
# pm2 kill
# npm remove pm2 -g

# Install pm2 and run pm2 daemon
# echo "Installing pm2 globally..."
# npm install pm2 -g
# pm2 status

# Install npm packages
# echo "Running npm install -g"
# npm install -g

#Restart the node
# echo "Restarting node..."
# pm2 start app.js
