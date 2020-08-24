const Command = require('../../Command');
const Discord = require('discord.js');

module.exports = class Region extends Command {
	match(client, message, args) {
        return args.length == 0 || (args.length == 1 && [2, 3].indexOf(args[0].length) !== -1);
    }
    
    action(client, message, args) {
		// if(args.length == 0) return message.channel.send(new Discord.MessageEmbed().setTitle('Regions').setDescription(Object.keys(client.riotAPI.REGIONS).join(', ')));
		// if(Object.keys(client.riotAPI.REGIONS).indexOf(args[0].toUpperCase())!==-1) {
		// 	guilds.updateProp(message.guild.id, 'region', args[0].toUpperCase());
		// 	message.channel.send(new Discord.MessageEmbed().setTitle(':white_check_mark: Region updated').setDescription('New region selected: '+args[0].toUpperCase()).setColor(0x77b255));
		// }
		// else message.channel.send(new Discord.MessageEmbed().setTitle(':x: Invalid region').setDescription('Type the same command without argument to see availible regions.').setColor(0xdd2e44));
	}

	get description() {
		return `Change your server preference about which region you want to search summoners.`;
	}

	get usage() {
		return `region {region (optional)}`;
	}
}