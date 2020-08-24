const Command = require('../../Command');

module.exports = class Spec extends Command {
	hidden = true;
	
	match(client, message, args) {
        return 0 < args.length && args.length < 3;
    }
    
    action(client, message, args) {
		
	}

	get description() {
		return `Show basic informations about the current game of a player.`;
	}

	get usage() {
		return `spec summonerName`;
	}
}