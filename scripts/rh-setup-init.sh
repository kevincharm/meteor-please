#!/bin/bash

# enable EPEL
sudo yum install -y epel-release
sudo yum update -y
# install compilers for npm
sudo yum install -y gcc-c++ make

# create user
sudo useradd meteor-please