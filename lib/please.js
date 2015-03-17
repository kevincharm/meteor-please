var nodemiral = require('nodemiral-forcetty');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var PATH_TO_SCRIPTS = path.resolve(__dirname, '../scripts');
var PATH_TO_CONFS = path.resolve(__dirname, '../conf')
var PATH_TO_INIT_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-init.sh');
var PATH_TO_NODE_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-node.sh');
var PATH_TO_MONGO_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-mongo.sh');
var PATH_TO_NGINX_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-nginx.sh');
var PATH_TO_BUILD_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-build.sh');
var PATH_TO_DEPLOY_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-deploy.sh');
var PATH_TO_NGINX_CONF = path.resolve(PATH_TO_CONFS, 'nginx.conf');
var PATH_TO_SYSTEMD_CONF = path.resolve(PATH_TO_CONFS, 'noded.service');

module.exports = please;

function please (config, current_dir) {
	this.config = config;
	this.current_dir = current_dir;

	var server = this.config.servers[0];
	var host = server.host;
	var auth = {username: server.username};
	var options = {
		ssh: {'StrictHostKeyChecking': 'no', 'UserKnownHostsFile': '/dev/null'}
	};
	if(server.pem) {
		auth.pem = fs.readFileSync(path.resolve(server.pem), 'utf8');
	} else {
		auth.password = server.password;
	}

	if(server.sshOptions) {
		for(var key in server.sshOptions) {
			options.ssh[key] = server.sshOptions[key];
		}
	}

	this.session = nodemiral.session(host, auth, options);

	//console.log(this.config.servers[0] + "\n");
	//console.log(this.session);

	var PATH_TO_SETTINGS_JSON = path.resolve(this.current_dir, 'settings.json');
	if (fs.existsSync(PATH_TO_SETTINGS_JSON)) {
		this.config.env['METEOR_SETTINGS'] = JSON.stringify(require(PATH_TO_SETTINGS_JSON));
	}
}

please.prototype.setup = function () {
	var taskList = nodemiral.taskList('Initialise RHEL environment');

	// Queue init script
	taskList.executeScript('Installing EPEL & build tools...', {
		script: PATH_TO_INIT_SCRIPT
	});

	// Queue nodejs install script
	if (this.config.setupNode) {
		taskList.executeScript('Installing nodejs...', {
			script: PATH_TO_NODE_SCRIPT,
			vars: {
				nodeVersion: this.config.nodeVersion
			}
		});
	}

	// Queue mongodb install script
	if (this.config.setupMongo) {
		taskList.executeScript('Installing mongodb*...', {
			script: PATH_TO_MONGO_SCRIPT
		});
	}

	// Queue nginx install script
	if (this.config.setupNginx) {
		taskList.executeScript('Installing nginx...', {
			script: PATH_TO_NGINX_SCRIPT,
			vars: {
				appSiteUrl: this.config.appSiteUrl
			}
		});
		
		taskList.copy('Setting up nginx...', {
			src: PATH_TO_NGINX_CONF,
			dest: '/etc/nginx/nginx.conf'
		});
	}
	// Run task queue
	taskList.run(this.session);
};

please.prototype.deploy = function () {
	// Deploy app to server
	console.log('Building your app...'.blue);

	var taskList = nodemiral.taskList('Deploying ' + this.config.appName + ' to server...');

	// Queue local build + systemd setup
	var thisSession = this.session;
	var config_app = this.config.app;
	var config_appName = this.config.appName;
	var config_appUser = this.config.appUser || 'meteor-please';
	var config_appRemoteTargetPath = '/home/' + config_appUser;
	var config_env_MONGO_URL = this.config.env.MONGO_URL;
	process.env.APP_NAME = this.appUser;
	process.env.APP_LOCAL_PATH = this.config.app;

	var bash = spawn("bash", [PATH_TO_BUILD_SCRIPT], {cwd: this.config.app});
	bash.stdout.on('data', function (data) {
		console.log(data.toString());
	});
	bash.stderr.on('data', function (data) {
		console.log(data.toString());
	});
	bash.on('error', function (err) {
		console.log(err.message);
	})
	bash.on('close', function (code) {
		if (code) {
			// BUILD ERROR!
			console.error('Error while building: ' + code);
		} else {
			// BUILD SUCCESS!!!
			// scp bundle to server
			taskList.copy('Uploading bundle... (This may take a while)', {
				src: config_app + '/bundle/' + config_appName + '.tar.gz',
				dest: config_appRemoteTargetPath + '/' + config_appName + '.tar.gz'
			});
			// scp the systemd template to server
			taskList.copy('Configuring systemd daemon for ' + config_appName, {
				src: PATH_TO_SYSTEMD_CONF,
				dest: '/etc/systemd/system/' + config_appName + '.service',
				vars: {
					appMongoUrl: config_env_MONGO_URL || ('mongodb://127.0.0.1:27017/' + config_appName),
					appUser: config_appUser || 'meteor-please',
					appName: config_appName
				}
			});
			// run deploy script on server
			taskList.executeScript('Deploying bundle...', {
				script: PATH_TO_DEPLOY_SCRIPT,
				vars: {
					appName: config_appName,
					appUser: config_appUser,
					appRemoteTargetPath: config_appRemoteTargetPath
				}
			});
			taskList.run(thisSession);
		}
	});
};