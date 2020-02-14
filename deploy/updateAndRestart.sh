set -e

sudo su

chmod 755 /home/ubuntu/archive-backend/
cd /home/ubuntu/archive-backend/

# Stop the previous pm2
echo "Killing previous pm2 and removing pm2..."
pm2 kill
npm remove pm2 -g

# Install pm2 and run pm2 daemon
echo "Installing pm2 globally..."
npm install pm2 -g
pm2 status

# Install npm packages
echo "Running npm install -g"
npm install -g

Restart the node
echo "Restarting node..."
pm2 start app.js
