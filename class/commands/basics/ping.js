const Command = require('../../class.command.js');

module.exports = class Ping extends Command { 
    match(args) {
        return args.length === 0;
    }
    
    action(message, args) {
        message.channel.send("Pinging...").then(msg => {
			let ping = msg.createdTimestamp - message.createdTimestamp;
			msg.edit(`:ping_pong: pong !\nBot latency: *${ping}ms*`);
		});
	}
	
	get description() {
		return `Returns the ping between the Discord server and me.`;
	}

	get usage() {
		return `ping`;
	}
}