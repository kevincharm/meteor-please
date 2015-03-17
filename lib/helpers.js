var exec = require('child_process').exec;

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
