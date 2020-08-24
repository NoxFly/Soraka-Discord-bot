const fs = require('file-system');
const root = require('../index.js').root;

module.exports = class GuildPreference {
	constructor() {
		this.path = `${root}/data/guilds`;
		this.guilds = {};
	}

	prepare(Client) {
		let guilds = Client.guilds;
		guilds.cache.each(guild => {
			if(!fs.existsSync(`${this.path}/${guild.id}.json`)) {
				console.log('Found a guild that is not saved yet ! '+guild.id);
				this.guilds[guild.id] = this.setupGuild();
				this.saveGuild(guild.id);
			} else {
				fs.readFile(`${this.path}/${guild.id}.json`, (err, data) => {
					if(!err) {
						this.guilds[guild.id] = JSON.parse(data);
					}
				});
			}
		});
	}

	setupGuild() {
		return {
			region: 'EUW',
			lang: 'us'
		};
	}

	saveGuild(id) {
		if(id in this.guilds) {
			fs.writeFile(`${root}/data/guilds/${id}.json`, JSON.stringify(this.guilds[id]));
		}
	}

	addProp(name, value) {
		let keys = Object.keys(this.guilds);
		keys.forEach(key => {
			this.guilds[key][name] = value;
			this.saveGuild(key);
		});
	}

	updateProp(guildId, prop, value) {
		if(guildId in this.guilds && prop in this.guilds[guildId]) {
			this.guilds[guildId][prop] = value;
			this.saveGuild(guildId);
		}
	}
}