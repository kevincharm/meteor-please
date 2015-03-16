#!/bin/bash

# install mongodb & mongodb-server
sudo yum install -y mongodb*
# mongodb daemon
sudo systemctl enable mongod
sudo systemctl start mongod