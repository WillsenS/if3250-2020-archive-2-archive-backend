set -e

sudo su

chmod 755 /home/ubuntu/archive-backend/
cd /home/ubuntu/archive-backend/

# Stop the previous pm2
echo "Killing previous pm2 and deleting frontend from pm2"
pm2 delete backend

# Install npm packages
echo "Running npm install -g"
npm install -g

# Restart the node
echo "Restarting node..."
pm2 start app.js --name "backend"
