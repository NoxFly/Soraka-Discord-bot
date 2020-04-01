const Command = require('../../class.command.js');
const riotAPI = require('../../../index.js').App.riotAPI;

module.exports = class Splash extends Command { 
    match(args) {
        return true;
    }
    
    action(message, args) {
		let champion = null;
		if(args.length > 0) {
			champion = (args.map(arg => arg.charAt(0).toUpperCase() + arg.slice(1))).join('');
			if(/'.+/.test(champion)) {
				let i = champion.indexOf("'");
				champion.replace(champion[i+1], champion[i+1].toLowerCase())
				champion = champion.substring(0, i) + champion.substring(i+1);
			}
		} else {
			let r = Math.floor(Math.random()*Object.keys(riotAPI.champions).length);
			champion = Object.keys(riotAPI.champions)[r];
		}

		message.channel.send(riotAPI.getSplash(champion));
	}
	
	get description() {
		return `Get the splashart of a champion.`;
	}

	get usage() {
		return `splash {champion (optional)}`;
	}
}