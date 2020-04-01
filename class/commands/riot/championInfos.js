const Discord = require('discord.js');
const riotAPI = require('../../../index.js').App.riotAPI;

module.exports = class championInfos {
	showData(message, champion) {
		let stats = champion.stats;

		let embed = new Discord.MessageEmbed()
			.setThumbnail(riotAPI.championSquare(champion.id))
			.setTitle(champion.name)
			.addFields(
				{name: 'Title', value: champion.title},
				{name: 'Infos', value: `• Attack: ${champion.info.attack}, • Defense: ${champion.info.defense}, • Magic: ${champion.info.magic}, • Difficulty: ${champion.info.difficulty}`},
				{name: 'Type', value: champion.tags.join(', '), inline: true},
				{name: 'Partype', value: champion.partype, inline: true},
				{name: 'Stats', value: `
					• **Hp**: ${stats.hp} + ${stats.hpperlevel}/Level
					${champion.partype!='None'? '• **'+champion.partype+'**: '+stats.mp+' + '+stats.mpperlevel+'/Level\n' : ''}• **Armor**: ${stats.armor} + ${stats.armorperlevel}/Level
					• **Spellblock**: ${stats.spellblock} + ${stats.spellblockperlevel}/Level
					• **hp regen**: ${stats.hpregen} + ${stats.hpregenperlevel}/Level ${champion.partype != 'None'? '\n• **'+champion.partype+' regen**: '+stats.mpregen+' + '+stats.mpregenperlevel+'/Level' : ''}
					• **AD**: ${stats.attackdamage} + ${stats.attackdamageperlevel}/Level
					• **attack speed**: ${stats.attackspeed} + ${stats.attackspeedperlevel}/Level
					• **critics**: ${stats.crit} + ${stats.critperlevel}/Level
					• **attack range**: ${stats.attackrange}
					• **movespeed**: ${stats.movespeed}
				`},
			);

		message.channel.send(embed);
	}
}