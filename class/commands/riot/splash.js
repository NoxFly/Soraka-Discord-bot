const Command = require('../../Command');

module.exports = class Splash extends Command { 
    match(client, message, args) {
        return true;
    }
    
    action(client, message, args) {
		let champion = null;

		if(args.length > 0) {
			champion = (args.map(arg => arg.charAt(0).toUpperCase() + arg.slice(1))).join('').replace(/\d+/g, '');

			if(/'.+/.test(champion)) {
				const i = champion.indexOf("'");
				champion = champion.replace(champion[i+1], champion[i+1].toLowerCase());
				champion = champion.substring(0, i) + champion.substring(i+1);
			}
		}
		
		else {
			const r = Math.floor(Math.random() * Object.keys(client.riotAPI.champions).length);
			champion = Object.keys(client.riotAPI.champions)[r];
		}

		message.channel.send(client.riotAPI.getSplash(champion, args.slice(-1)));
	}
	
	get description() {
		return `Get the splashart of a champion.`;
	}

	get usage() {
		return `splash {champion (optional)}`;
	}
}