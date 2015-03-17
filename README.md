# meteor-please
[![npm version](https://badge.fury.io/js/mplz.svg)](http://badge.fury.io/js/mplz)
###Simple Meteor Deployment for RHEL/CentOS 7+
Deploy your Meteor/nodejs project on RHEL flavoured boxes via SSH, and keep your apps alive with __systemd__. Your app is served through reverse proxy by __nginx__. Uses some codebase from [arunoda](https://github.com/arunoda)'s [meteor-up](https://github.com/arunoda/meteor-up) and [nodemiral-forcetty](https://github.com/hellstad/nodemiral-forcetty). Currently has very basic functionality; more features coming soon!

##Installation
`npm install -g mplz`

##Usage
You need to create a `mplz.json` configuration file in your local Meteor project directory with this structure. (I'll add a prompt in the future)
````js
{
  // Uses similar structure to arunoda's mup settings.
  // Server authentication info
  "servers": [
    {
      "host": "hostname",
      "username": "root",
      //"password": "password"
      // or pem file (ssh based authentication)
      "pem": "~/.ssh/id_rsa"
    }
  ],

  // Install mongodb
  "setupMongo": true,

  // Install nodejs
  "setupNode": true,

  // nodejs version to use
  "nodeVersion": "0.10.36",

  // Install nginx
  "setupNginx": true,

  // Application name (No spaces)
  "appName": "meteor",

  // Application site URL (required for nginx)
  "appSiteUrl": "http://mydomain.com",

  // Local app path
  "app": ".",

  // Configure environment
  "env": {
    "ROOT_URL": "http://127.0.0.1"
  },

  "deployCheckWaitTime": 15
}
````
Once you've got a configuration file, you can spin up your server, then use this command inside your project directory to install the production environment (nodejs, mongodb, nginx):
````
mplz setup
````

Now go grab a coffee, because it will probably take some time for all the things to install.

After the server setup is done, you can run this command to deploy your app:
````
mplz deploy
````

Easy!

##Commands
````
mplz setup
mplz deploy
mplz reconfig
mplz start
mplz stop
mplz restart
````
