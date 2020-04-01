const Command = require('../../class.command');
const {riotAPI, guilds} = require('../../../index.js').App;
const Discord = require('discord.js');

module.exports = class Region extends Command {
	match(args) {
        return args.length == 0 || (args.length == 1 && [2].indexOf(args[0].length) !== -1);
    }
    
    action(message, args) {
		if(args.length == 0) return message.channel.send(new Discord.MessageEmbed().setTitle('Langs').setDescription(Object.keys(riotAPI.LANGS).join(', ')));
		if(Object.keys(riotAPI.LANGS).indexOf(args[0].toLowerCase())!==-1) {
			guilds.updateProp(message.guild.id, 'lang', args[0].toLowerCase());
			message.channel.send(new Discord.MessageEmbed().setTitle(':white_check_mark: Lang updated').setDescription('New language selected: '+args[0].toLowerCase()).setColor(0x77b255));
		}
		else message.channel.send(new Discord.MessageEmbed().setTitle(':x: Invalid lang').setDescription('Type the same command without argument to see availible languages.').setColor(0xdd2e44));
	}

	get description() {
		return `Change your server preference about which lang you prefer have informations about LoL.`;
	}

	get usage() {
		return `lang {language (optional)}`;
	}
}