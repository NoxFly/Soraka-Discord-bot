const Command = require('../../Command');
const Discord = require('discord.js');

module.exports = class Guilds extends Command {
    match(client, message, args) {
        return args.length < 2;
    }
    
    action(client, message, args) {
		let guilds = [];

		message.client.guilds.cache.each(guild => {guilds.push(`${guild.name} \`[${guild.id}]\``);});

		const embed = new Discord.MessageEmbed()
			.setTitle("Guilds I'm in")
			.setDescription(guilds.join('\n'));

		message.channel.send(embed);
	}
	
	get description() {
		return `Shows the guilds where I'm currently in.`;
	}

	get usage() {
		return `guilds`;
	}
}