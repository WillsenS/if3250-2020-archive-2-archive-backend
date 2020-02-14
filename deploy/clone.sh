#!/bin/bash

set -e

# Delete the old repository folder
sudo su
rm -rf /home/ubuntu/archive-backend/

# Clone the github repository staging branch (usually develop)
cd /home/ubuntu/
git clone -b task-9/ci-cd --single-branch git@gitlab.informatika.org:if3250-2020-archive-2/archive-backend.git

chmod 777 /home/ubuntu/archive-backend/