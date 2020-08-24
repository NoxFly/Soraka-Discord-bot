const Command = require('../../Command');
const Discord = require('discord.js');

module.exports = class Spec extends Command {
	match(client, message, args) {
        return (0 < args.length && args.length < 3);
    }
    
    async action(client, message, args) {
		const msg = await message.channel.send(`Searching in the summoner's rift...`);

		const data = await client.riotAPI.spectateGame(args[0], args[1]?? client.riotAPI.region);
		
		
		if(!data || data.match.status?.status_code === 404) {
			const desc = (data !== null)? `:x: **${data.summoner.name}**(${data.summoner.region}) **is currently not in game.**` : ':x: **This player does not exist**';
			
			const embed = new Discord.MessageEmbed()
			.setColor(0xdd2e44)
			.setDescription(desc);
			
			msg.edit('', embed);
		}
		
		else {			

			// blue team = team 1
			// red team = team 2
			// but we reverse them for the embed, to get the red team above, like in the map

			const team1 = data.match.participants.filter(player => player.teamId === 100).map(player => {
				return '• ' + player.summonerName
			}).join('\n');



			const team2 = data.match.participants.filter(player => player.teamId === 200).map(player => {
				return '• ' + player.summonerName
			}).join('\n');






			const embed = new Discord.MessageEmbed()
				.setTitle(`Current game - ${data.summoner.name} - ${data.summoner.region}`)
				.addField(":red_circle: Team 1", team1)
				.addField(":blue_circle: Team 2", team2)
				.setTimestamp();


			msg.edit('', embed);
		}
	}

	get description() {
		return `Show basic informations about the current game of a player.`;
	}

	get usage() {
		return `spec summonerName`;
	}
}