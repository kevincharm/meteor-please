# meteor-please
[![npm version](https://badge.fury.io/js/mplz.svg)](http://badge.fury.io/js/mplz)
### Simple Meteor Deployment for RHEL/CentOS 7+
Deploy your Meteor app on RHEL flavoured boxes via SSH, and keep your apps alive with __systemd__. Your app is served through reverse proxy by __nginx__. Based on [meteor-up](https://github.com/arunoda/meteor-up).

## Installation
````
npm install -g mplz
````

## Usage
##### 1. Initialise
Simply run in your Meteor project's directory:
````
mplz
````
You'll get a prompt to automatically configure a `mplz.json` for your project.

##### 2. Setup Your Environment
Once you've got a configuration file, you can spin up your server, then use this command inside your project directory to install the production environment (nodejs, mongodb, nginx):
````
mplz setup
````

Now go grab a coffee, because it will probably take some time for all the things to install.

##### 3. Deploy Your App
After the server setup is done, you can run this command to deploy your app:
````
mplz deploy
````

Easy!

## Commands
__mplz init__ Reconfigures your app's `mplz.json` settings file.

__mplz setup__ Sets up your server according to your `mplz.json` settings.

__mplz deploy__ Deploys your app according to your `mplz.json` settings.

__mplz reconfig__ Apply any configuration changes if your `mplz.json` has been modified since last setup.

__mplz start__ Starts your app. (systemd)

__mplz stop__ Stops your app. (systemd)

__mplz restart__ Restarts your app. (systemd)

__mplz delete__ Deletes your app from the deployment directory.

## TODOs
- SSL
- Multiple instances/load balancing/oplog tailing
- Prompt cleanup/validation
- Support for node apps
- Exclude folders
