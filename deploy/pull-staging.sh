#!/bin/bash

set -e

# Change to root
sudo su

# Clone the github repository staging branch (usually develop)
cd /home/ubuntu/
git pull

chmod 777 /home/ubuntu/archive-backend/