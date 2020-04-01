const Command = require('../../class.command.js');
const Discord = require('discord.js');
const tag = require('../../../index.js').App.tag;
const Client = require('../../../index.js').App.Client;

module.exports = class Help extends Command {
	numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
	nbCmdPerPage = 5;
	
	match(args) {
        return args.length < 2;
    }
    
    action(message, args) {
		if(args.length == 0 || args.length == 2) {
			let commands = Object.keys(this.commandList);
			let nbPage = Math.ceil(commands.length/this.nbCmdPerPage);
			let min = 0;
			let max = this.nbCmdPerPage > commands.length? commands.length : this.nbCmdPerPage;

			if(args.length == 2) {
				min = args[0];
				max = args[1];
			}

			let embed = new Discord.MessageEmbed().setTitle('Command list');

			for(let i = min; i < max; i++) {
				let command = commands[i];
				embed.addField(command, this.commandList[command].description+'\nUsage: `'+tag+this.commandList[command].usage+'`');
			}

			if(args.length == 0) {
				message.channel.send(embed).then(msg => {
					for(let i=0; i<nbPage; i++) {
						msg.react(this.numbers[i]);
					}
				});
			} else {
				message.edit(embed);
			}
		}

		else {
			if(args[0] in this.commandList) {
				message.channel.send(new Discord.MessageEmbed().setTitle(args[0]).setDescription(this.commandList[args[0]].description+'\nUsage: `'+tag+this.commandList[args[0]].usage+'`'));
			} else {
				message.channel.send("I can't help you for a command that doesn't exist :grimacing: :disappointed_relieved:");
			}
		}
	}

	reaction(messageReaction, user) {
		const message = messageReaction.message;

		let n = this.numbers.indexOf(messageReaction.emoji.name);
		let min = 0+this.nbCmdPerPage*n;
		let max = min+this.nbCmdPerPage;
		max = max > Object.keys(this.commandList).length? Object.keys(this.commandList).length : max;
		this.action(message, [min, max]);
	}
	
	get description() {
		return "Display the description and the usage of all commands";
	}

	get usage() {
		return "help {commandName (optionnal)}";
	}
}