#!/bin/bash

# install nodejs & n from EPEL
sudo yum install -y nodejs npm
sudo npm install -g n
<% if (nodeVersion) { %>
	sudo n <%= nodeVersion %>
<% } else { %>
	sudo n 0.10.36
<% } %>