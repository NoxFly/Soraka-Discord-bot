const Discord = require('discord.js');

module.exports = class championInfos {
	showData(client, message, champion) {
		let stats = champion.stats;

		let embed = new Discord.MessageEmbed()
			.setThumbnail(client.riotAPI.championSquare(champion.id))
			.setTitle(champion.name)
			.addFields(
				{name: 'Title', value: champion.title},
				{name: 'Infos', value: `• Attack: ${champion.info.attack},\n• Defense: ${champion.info.defense},\n• Magic: ${champion.info.magic},\n• Difficulty: ${champion.info.difficulty}`},
				{name: 'Type', value: champion.tags.join(', '), inline: true},
				{name: 'Partype', value: champion.partype, inline: true},
				{name: 'Stats', value: `
					• **Hp**: ${stats.hp} + ${stats.hpperlevel}/Level
					${champion.partype!='None'? '• **'+champion.partype+'**: '+stats.mp+' + '+stats.mpperlevel+'/Level\n' : ''}• **Armor**: ${stats.armor} + ${stats.armorperlevel}/Level
					• **Spellblock**: ${stats.spellblock} + ${stats.spellblockperlevel}/Level
					• **Hp regen**: ${stats.hpregen} + ${stats.hpregenperlevel}/Level ${champion.partype != 'None'? '\n• **'+champion.partype+' regen**: '+stats.mpregen+' + '+stats.mpregenperlevel+'/Level' : ''}
					• **Ad**: ${stats.attackdamage} + ${stats.attackdamageperlevel}/Level
					• **Attack speed**: ${stats.attackspeed} + ${stats.attackspeedperlevel}/Level
					• **Critics**: ${stats.crit} + ${stats.critperlevel}/Level
					• **Attack range**: ${stats.attackrange}
					• **Movespeed**: ${stats.movespeed}
				`},
			);

		message.channel.send(embed);
	}
}