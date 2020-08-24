const Command = require('../../Command');
const Discord = require('discord.js');
const permissions = 322624;

module.exports = class Ping extends Command { 
    match(client, message, args) {
        return args.length === 0;
    }
    
    action(client, message, args) {

		const embed = new Discord.MessageEmbed()
			.setTitle('Invite me !')
			.setColor(0x007fff)
			.setThumbnail(client.user.avatarURL())
			.addFields(
				{name: 'Link', value: `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=${permissions}`},
				{name: 'Paypal', value: `It's not free to host me !\nA small donation can host me many months !\nhttps://paypal.me/NoxFly`}
			);
			
        message.channel.send(embed);
	}
	
	get description() {
		return `Returns the invite link to get me in your server.`;
	}

	get usage() {
		return `invite`;
	}
}