class Commands {
    constructor() {
		// all commands
		// this.*, * = the command name
		this.ping = new (require('./commands/basics/ping.js'));
		this.guilds = new (require('./commands/basics/guilds.js'));
		this.server = new (require('./commands/basics/server.js'));
		this.invite = new (require('./commands/basics/invite.js'));

		this.splash = new (require('./commands/riot/splash.js'));
		this.champions = new (require('./commands/riot/champions.js'));
		this.brave = new (require('./commands/riot/brave.js'));
		this.summoner = new (require('./commands/riot/summoner.js'));
		this.rotation = new (require('./commands/riot/rotation.js'));
		this.region = new (require('./commands/riot/region.js'));
		this.lang = new (require('./commands/riot/lang.js'));
		
		// help command
		this.help = new (require('./commands/basics/help.js'));
		this.help.commandList = this;
    }
}

module.exports = Commands;