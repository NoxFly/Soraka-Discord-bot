const Command = require('../../Command');
const Discord = require('discord.js');

const tag = '';

module.exports = class Help extends Command {
	numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
	nbCmdPerPage = 5;
	
	match(client, message, args) {
        return args.length < 2;
    }
    
    action(client, message, args) {
		// list of commands - per page
		if(args.length == 0 || args.length == 2) {
			let commands = client.commands.filter(c => !c.hidden && ! c.restricted).array();

			let nbPage = Math.ceil(commands.length / this.nbCmdPerPage);

			let min = 0;
			let max = this.nbCmdPerPage > commands.length? commands.length : this.nbCmdPerPage;



			if(args.length == 2) {
				min = args[0];
				max = args[1];
			}

			let embed = new Discord.MessageEmbed()
				.setTitle('Command list - page ' + (min/this.nbCmdPerPage + 1))
				.setColor(0x007fff);

			for(let i = min; i < max; i++) {
				let command = commands[i];
				if(!command) continue;
				embed.addField(command.name, command.description +'\nUsage: `'+ client.prefix + command.usage +'`');
			}



			if(args.length == 0) {
				message.channel.send(embed).then(async msg => {
					for(let i=0; i < nbPage; i++) {
						await msg.react(this.numbers[i]);
					}

					const collector = msg.createReactionCollector((r, user) => !user.bot && this.numbers.includes(r.emoji.name), { time: 60000 });

					collector.on('collect', r => {
						msg.reactions.resolve(r.emoji.name).users.remove(r.users.cache.lastKey());
						this.reaction(client, msg, r.emoji.name);
					});

					collector.on('end', collected => {
						msg.reactions.removeAll();
					});
				});
			}
			
			else {
				message.edit(embed);
			}
		}


		// details of a given command
		else {
			if(client.commands.has(args[0])) {
				const command = client.commands.get(args[0]);

				const embed = new Discord.MessageEmbed()
					.setTitle(`Command : ${args[0]}`)
					.setColor(0x007fff)
					.addFields(
						{name: 'description :', value: command.description},
						{name: 'Usage :', value: '`' + client.prefix + command.usage + '`'}
					);

				message.channel.send(embed);
			} else {
				message.channel.send("I can't help you for a command that doesn't exist :grimacing: :disappointed_relieved:");
			}
		}
	}

	/**
	 * Page changment handler
	 * @param {Client} client Discord's client
	 * @param {Message} message Discord's message - help message
	 * @param {string} emojiName emoji name (page number)
	 */
	reaction(client, message, emojiName) {
		let n = this.numbers.indexOf(emojiName);

		let min = 0 + this.nbCmdPerPage * n;

		let max = min + this.nbCmdPerPage;
		max = max > client.commands.size? client.commands.size : max;

		this.action(client, message, [min, max]);
	}
	
	get description() {
		return "Display the description and the usage of all commands";
	}

	get usage() {
		return "help {commandName (optionnal)}";
	}
}