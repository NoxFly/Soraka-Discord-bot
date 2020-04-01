const Command = require('../../class.command.js');

module.exports = class Guilds extends Command {
    match(args) {
        return args.length < 2;
    }
    
    action(message, args) {
		let page = 1;
		if(args.length == 1) page = parseInt(args[0]);
		if(isNaN(page)) page = 1;

		let guilds = [];
		message.client.guilds.cache.each(guild => {guilds.push(`\`${guild.name} [${guild.id}]\``);});
		message.channel.send(`Guilds I'm in: ${guilds.join(', ')}`);
	}
	
	get description() {
		return `Shows the guilds where I'm currently in.`;
	}

	get usage() {
		return `guilds`;
	}
}