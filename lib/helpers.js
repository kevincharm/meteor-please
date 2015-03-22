var exec = require('child_process').exec;
var path = require('path');
var Prompt = require('prompt-improved');
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
  console.error('\treconfig      - Reconfigure the server and restart');
  console.error('');
  console.error('\tstart         - Start your app instances');
  console.error('\tstop          - Stop your app instances');
  console.error('\trestart       - Restart your app instances\n');
};

exports.initJson = function(cwd) {
  // Build JSON
  var PATH_TO_MPLZ_SETTINGS_JSON = path.resolve(cwd, 'mplz.json');
  var mplzJson = {};

  prompt = new Prompt({
    suffix: ':\n\t'
  });

  prompt.ask([
    {
      question: "What is the name of your app?",
      key: 'appname',
      require: true,
      default: 'meteorapp'
    },
    {
      question: "SSH hostname",
      key: 'hostname',
      required: true,
      default: '255.255.255.255'
    },
    {
      question: "SSH username",
      key: 'username',
      required: true,
      default: 'root'
    },
    {
      question: "SSH password (Skip to use a key instead)",
      key: 'sshpass'
    },
    {
      question: "Please specify the path to your SSH key",
      key: 'sshkey',
      default: '~/.ssh/id_rsa'
    },
    {
      question: "Would you like to setup MongoDB?",
      key: 'setupmongo',
      default: 'y'
    },
    {
      question: "Would you like to setup Node?",
      key: 'setupnode',
      default: 'y'
    },
    {
      question: "Which version of Node?",
      key: 'nodeversion',
      default: '0.10.36'
    },
    {
      question: "Would you like to setup Nginx?",
      key: 'setupnginx',
      default: 'y'
    },
    {
      question: "What domain name will your app be served on? (Required for Nginx)",
      key: 'appdomain',
      default: 'http://mydomain.com'
    }
  ], function (err, res) {
    if (err) {
      return console.error(err);
    } else {
      var yesNo = {y: true, n: false};
      mplzJson = {
        appName: res.appname,
        servers: [
          {
            host: res.hostname,
            username: res.username
          }
        ],
        setupMongo: yesNo[res.setupmongo],
        setupNode: yesNo[res.setupnode],
        nodeVersion: res.nodeversion,
        setupNginx: yesNo[res.setupnginx],
        appSiteUrl: res.appdomain,
        app: '.',
        env: {
          ROOT_URL: '127.0.0.1'
        }
      };
      if (res.password) {
        mplzJson.servers[0].password = res.sshpass;
      } else {
        mplzJson.servers[0].pem = res.sshkey;
      }
      jsonFile.writeFile(PATH_TO_MPLZ_SETTINGS_JSON, mplzJson);
    }
  });
};
