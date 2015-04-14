var exec = require('child_process').exec;
var path = require('path');
var prompt = require('prompt');
var jsonFile = require('jsonfile');

exports.checkSshPassExists = function(callback) {
  exec('sshpass -V', function(err, stdout, stderr) {
    if(err) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

exports.printHelp = function() {
  console.error('\n\tValid Actions');
  console.error('\t---');
  console.error('\tsetup         - Setup the server');
  console.error('');
  console.error('\tdeploy        - Deploy app to server');
  console.error('\tdelete        - Delete app from server');
  console.error('\treconfig      - Reconfigure the server and restart');
  console.error('');
  console.error('\tstart         - Start your app instances');
  console.error('\tstop          - Stop your app instances');
  console.error('\trestart       - Restart your app instances');
  console.error('\treboot        - Reboot your server\n');
};

exports.initJson = function(cwd) {
  // Build JSON
  console.log("Configuring mplz.json settings file...".cyan);

  var PATH_TO_MPLZ_SETTINGS_JSON = path.resolve(cwd, 'mplz.json');
  var mplzJson = {};

  prompt.message = "[mplz.json]".magenta;
  prompt.start();
  prompt.get({properties: {
    appname: {
      description: "What is the name of your app?",
      required: true,
      default: 'meteorapp'
    },
    hostname: {
      description: "SSH hostname",
      required: true,
      default: '255.255.255.255'
    },
    username: {
      description: "SSH username",
      required: true,
      default: 'root'
    },
    sshpass: {
      description: "SSH password (Skip to use a key instead)"
    },
    sshkey: {
      description: "Please specify the path to your SSH key (e.g. ~/.ssh/id_rsa)"
    },
    sslcert: {
      description: "Please specify the path to your SSL cert (This will be copied to /etc/ssl)"
    },
    sslkey: {
      description: "Please specify the path to your SSL key (This will be copied to /etc/ssl)"
    },
    setupmongo: {
      description: "Would you like to setup MongoDB?",
      default: 'y'
    },
    setupnode: {
      description: "Would you like to setup Node?",
      default: 'y'
    },
    nodeversion: {
      description: "Which version of Node?",
      default: '0.10.36'
    },
    setupnginx: {
      description: "Would you like to setup Nginx?",
      default: 'y'
    },
    appdomain: {
      description: "What domain name will your app be served on? (Required for Nginx server_name, don't include http://)",
      default: 'mydomain.com'
    }
  }}, function (err, res) {
    if (err) {
      return console.error(err);
    } else {
      var yesNo = {y: true, n: false, yes: true, no: false};
      mplzJson = {
        appName: res.appname,
        servers: [
          {
            host: res.hostname,
            username: res.username
          }
        ],
        setupMongo: yesNo[res.setupmongo.toLowerCase()],
        setupNode: yesNo[res.setupnode.toLowerCase()],
        nodeVersion: res.nodeversion,
        setupNginx: yesNo[res.setupnginx.toLowerCase()],
        sslcert: res.sslcert,
        sslkey: res.sslkey,
        appSiteUrl: res.appdomain,
        app: '.',
        env: {
          ROOT_URL: '127.0.0.1'
        }
      };
      if (res.sshpass) {
        mplzJson.servers[0].password = res.sshpass;
      } else {
        mplzJson.servers[0].pem = res.sshkey;
      }
      jsonFile.writeFile(PATH_TO_MPLZ_SETTINGS_JSON, mplzJson, function (err) {
        if (err) return console.error(err.red);
        console.log("You can now use mplz setup && deploy!".blue);
      });
    }
  });
};
