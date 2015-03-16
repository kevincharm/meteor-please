#!/bin/bash

# install nginx
sudo mkdir -p /etc/nginx
sudo yum install -y nginx
sudo mkdir /etc/nginx/sites-enabled
# nginx daemon
sudo systemctl enable nginx
sudo systemctl start nginx
# firewalld
sudo systemctl enable firewalld
sudo systemctl start firewalld
sudo firewall-cmd --permanent --zone=public --add-service=http 
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --reload