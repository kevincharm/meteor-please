var nodemiral = require('nodemiral-forcetty');
var path = require('path');
var fs = require('fs');

var PATH_TO_SCRIPTS = path.resolve(__dirname, '../scripts');
var PATH_TO_CONFS = path.resolve(__dirname, '../conf')
var PATH_TO_INIT_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-init.sh');
var PATH_TO_NODE_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-node.sh');
var PATH_TO_MONGO_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-mongo.sh');
var PATH_TO_NGINX_SCRIPT = path.resolve(PATH_TO_SCRIPTS, 'rh-setup-nginx.sh');
var PATH_TO_NGINX_CONF = path.resolve(PATH_TO_CONFS, 'nginx.conf');

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

please.prototype.init = function () {
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
			script: PATH_TO_NGINX_SCRIPT
		});
		/*
		taskList.copy('Copying default nginx.conf for meteor...', {
			src: PATH_TO_NGINX_CONF,
			dest: '/etc/nginx/nginx.conf'
		});
		*/
	}

	// TODO: setup {{pm2 meteorapp}}.service for systemd
	// don't use pm2? use systemd instead?

	// Run task queue
	taskList.run(this.session);
};

please.prototype.deploy = function () {
	// Deploy app to server
};