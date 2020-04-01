const Command = require('../../class.command.js');
const clientId = require('../../../index.js').App.clientId;
const Discord = require('discord.js');
const permissions = 322624;
const Client = require('../../../index.js').App.Client;

module.exports = class Ping extends Command { 
    match(args) {
        return args.length === 0;
    }
    
    action(message, args) {

		let embed = new Discord.MessageEmbed()
			.setTitle('Invite me !')
			.setColor(0x007fff)
			.setThumbnail(Client.user.avatarURL())
			.addFields(
				{name: 'Link', value: `https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissions}`},
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