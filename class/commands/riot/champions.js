const Command = require('../../class.command');
const riotAPI = require('../../../index.js').App.riotAPI;

module.exports = class championInfos extends Command {
	match(args) {
        return args.length == 0 || (args.length == 1 && /\w/.test(args[0]));
    }
    
    action(message, args) {
		let n = 1; // default page is n°1
		let limit = 20; // number of champions displayed on an column
		let type = 0; // 0 = int | 1 = char
		
		if(args.length == 1) { // if the user specify which page
			n = args[0];
			if(isNaN(n)) { // if he wants to sort by the first letter
				type = 1;
			} else { // if he wants to see a specific page
				n = parseInt(n);
			}
		}

		let championNames = Object.keys(riotAPI.champions);
		let txt = '```';
		if(type) {
			championNames = championNames.filter(champion => champion.toLowerCase().startsWith(n.toLowerCase()));
			txt += championNames.join('\n');
		} else {
			let start = (n-1)*(limit*2);
			let end = start+limit >= championNames.length? championNames : start+limit;

			for(let i=start; i < end; i++) {
				let champion = championNames[i];
				let champion2 = i+limit >= championNames.length ? '' : championNames[i+limit];
				txt += champion+(' '.repeat(16-champion.length))+champion2+'\n';
			}
		}

		txt += '```';
		if(txt != '``````') message.channel.send(txt);
	}

	get description() {
		return `List champion names`;
	}

	get usage() {
		return `champions {a-z/A-Z or page n° optional}`;
	}
}