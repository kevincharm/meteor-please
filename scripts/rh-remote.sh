#!/bin/bash

# config variables
SSH_SERVER=128.199.188.180
SSH_METEOR_USER=meteor-please
APP_REMOTE_TARGET_PATH=/home/meteor-please
APP_LOCAL_PATH=/users/kevincharm/dev/starscream
APP_NAME=starscream

# node env variables
NODE_MONGO_URL=mongodb://127.0.0.1:27017/$APP_NAME
NODE_PORT=3000
NODE_ROOT_URL=http://127.0.0.1
NODE_UID="UID"

# package meteor
cd $APP_LOCAL_PATH
meteor build bundle --architecture os.linux.x86_64
cd bundle

# scp to server
scp $APP_NAME.tar.gz root@$SSH_SERVER:$APP_REMOTE_TARGET_PATH
# connect to server as root
ssh root@$SSH_SERVER bash -c "'
sudo chown -R $SSH_METEOR_USER $APP_REMOTE_TARGET_PATH/$APP_NAME.tar.gz
su $SSH_METEOR_USER
cd $APP_REMOTE_TARGET_PATH

# stop previous running process
pm2 stop $APP_NAME

# unpack bundle / overwrite previous
tar -zxvf $APP_NAME.tar.gz
rm -rf $APP_NAME.tar.gz

# install npm dependencies
cd bundle/programs/server/
npm install

# start app
cd $APP_REMOTE_TARGET_PATH/bundle
MONGO_URL=$NODE_MONGO_URL PORT=$NODE_PORT ROOT_URL=$NODE_ROOT_URL pm2 start --name $NODE_UID main.js
'"