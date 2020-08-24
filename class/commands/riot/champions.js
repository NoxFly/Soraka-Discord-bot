const Command = require('../../Command');
const Discord = require('discord.js');

module.exports = class championInfos extends Command {
	match(client, message, args) {
        return args.length == 0 || (args.length == 1 && /\w+/.test(args[0]));
    }
    
    action(client, message, args) {
		let n = 1; // default page is n°1
		let limit = 20; // number of champions displayed on an column
		let type = 0; // 0 = int | 1 = char


		// if the user specify which page
		if(args.length == 1) {
			n = args[0];

			// if he wants to sort by the first letter
			if(isNaN(n)) {
				type = 1;
			}

			// if he wants to see a specific page
			else {
				n = parseInt(n);
			}
		}

		
		
		let championNames = Object.keys(client.riotAPI.champions);
		let txt = '';

		const embed = new Discord.MessageEmbed()
			.setTitle('Champions');
			
			
		// searching by name
		if(type) {
			championNames = championNames.filter(champion => champion.toLowerCase().startsWith(n.toLowerCase()));

			txt += '**Number of champions found :** ' + championNames.length;
			
			txt += '\n```' + championNames.join('\n');

		}
		
		// searching by page
		else {
			embed.setTitle(`Champions - page ${n}`);
			
			txt += '**Number of champions :** ' + championNames.length;

			txt += '\n```';

			let start = (n-1) * limit * 2;
			let end = (start + limit >= championNames.length)? championNames : start + limit;

			for(let i=start; i < end; i++) {
				const champion = championNames[i];
				const champion2 = (i + limit >= championNames.length)? '' : championNames[i+limit];

				txt += champion + (' '.repeat(16-champion.length)) + champion2 + '\n';
			}
		}

		txt += '```';

		if(txt.includes(':** 0')) {
			embed.setDescription('```No champion found```');
		}

		else {
			embed.setDescription(txt);
		}

		message.channel.send(embed);
	}

	get description() {
		return `List champion names`;
	}

	get usage() {
		return `champions {a-z/A-Z or page n° optional}`;
	}
}