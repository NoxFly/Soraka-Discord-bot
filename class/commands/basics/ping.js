const Command = require('../../Command');
const Discord = require('discord.js');

module.exports = class Ping extends Command { 
    match(client, message, args) {
        return args.length === 0;
    }
    
    action(client, message, args) {
        message.channel.send("Pinging...").then(msg => {
			const ping = msg.createdTimestamp - message.createdTimestamp;

			const embed = new Discord.MessageEmbed()
				.setTitle(`:ping_pong: pong !`)
				.setColor(0x007fff)
				.setDescription(`Bot latency: ${ping}ms`);

			msg.edit('', {embed});
		});
	}
	
	get description() {
		return `Returns the ping between the Discord server and me.`;
	}

	get usage() {
		return `ping`;
	}
}