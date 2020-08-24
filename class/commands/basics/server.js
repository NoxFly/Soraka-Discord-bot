const Command = require('../../Command');

module.exports = class Server extends Command {
    match(client, message, args) {
        return args.length == 0;
    }
    
    action(message, args) {
		let guild = message.guild;
		let nRoles = guild.roles.cache.array().length - 1;
		let onlineMembers = guild.members.cache.filter(member => member.presence.status !== 'offline').size;
		let channels = {text: 0, voice: 0, category: 0};
		guild.channels.cache.each(channel => {channels[channel.type]++;});

		let owner = guild.members.cache.find(member => member.id == guild.owner.id).user;

		let embed = new this.Discord.MessageEmbed()
			.setTitle(guild.name.toUpperCase() + ' informations')
			.setThumbnail(guild.iconURL())
			.setColor(0x43FF4E)
			.addFields(
				{name: 'owner', value: `• ${owner.tag}\n• (ID: ${owner.id})`},
				{name: 'Roles', value: `• ${nRoles}`},
				{name: 'Members', value: `• ${guild.members.cache.array().length}\n• Online: ${onlineMembers}`},
				{name: 'Channels', value: `• ${guild.channels.cache.array().length}\n• Text: ${channels.text}, Voice: ${channels.voice}, Category: ${channels.category}`},
				{name: 'Region', value: guild.region},
				{name: 'Created on', value: guild.createdAt}
			);

		message.channel.send(embed);
	}
	
	get description() {
		return `Shows informations about the server the message was sent.`;
	}

	get usage() {
		return `server`;
	}
}