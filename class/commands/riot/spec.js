const Command = require('../../class.command');
const riotAPI = require('../../../index.js').App.riotAPI;

module.exports = class Spec extends Command {
	match(args) {
        return 0 < args.length && args.length < 3;
    }
    
    action(message, args) {
		
	}

	get description() {
		return `Show basic informations about the current game of a player.`;
	}

	get usage() {
		return `spec summonerName`;
	}
}