const Command = require('../../Command');
const Discord = require('discord.js');
const Canvas = require('canvas');
const pms = require('pretty-ms');

Canvas.registerFont(`./asset/fonts/Roboto-Light.ttf`, {family: 'Roboto'});

module.exports = class Spec extends Command {
	
	match(client, message, args) {
        return (0 < args.length && args.length < 3);
    }
    
    async action({riotAPI, canvasManager, root, paths}, message, args) {
		const msg = await message.channel.send(`Searching in the summoner's rift...`);

		const data = await riotAPI.spectateGame(args[0], args[1]?? riotAPI.region);
		
		
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

			//msg.edit('', embed);
			
			
			await this.draw({riotAPI, canvasManager, root, paths}, message, data);
			
			msg.delete();
		}
	}

	async draw({riotAPI, canvasManager, root, paths}, message, data) {
		const canvas = Canvas.createCanvas(1080, 440);
		const ctx = canvas.getContext('2d');
		
		const bg = await canvasManager.load('fluid-background', `${root + paths.asset}/fluid-background.jpg`);
		ctx.drawImage(bg, 0, 0);


		ctx.fillStyle = '#00060b';
		ctx.fillRect(0, 0, ctx.canvas.width, 70);

		ctx.fillStyle = '#785a28';
		ctx.globalAlpha = 0.5;
		ctx.fillRect(ctx.canvas.width / 2, 70, 1, ctx.canvas.height);
		ctx.fillRect(0, 70, ctx.canvas.width, 1);
		ctx.globalAlpha = 1;

		let picSize = 50;
		let margin = {x: 20, y: 20};
		let x = ctx.canvas.width / 2 - picSize - margin.x;
		let y = 90;

		let banX = ctx.canvas.width / 2 - 20;
		let banVec = -1;

		ctx.textAlign = 'right';
		ctx.font = '17px Roboto';

		const rPart = data.match.participants.length / 2;

		// team
		for(let i=0; i < 2; i++) {
			// player
			for(let j=0; j < rPart; j++) {
				const player = data.match.participants[j + i*rPart];

				ctx.save();
					ctx.translate(x, y);

					ctx.fillStyle = '#a88b48';
					ctx.beginPath();
						ctx.arc(picSize/2, picSize/2, picSize/2, 0, 2 * Math.PI);
						ctx.fill();
					ctx.closePath();

					ctx.save();
						ctx.beginPath();
							ctx.arc(picSize/2, picSize/2, picSize/2 - 2, 0, 2 * Math.PI);
							ctx.clip();
						ctx.closePath();


						const champPic = await canvasManager.load(`champion-square-${riotAPI.getChampionById(player.championId).id}`, riotAPI.format(riotAPI.url('championSquare'), {
							version: riotAPI.VERSIONS.dd,
							champion: riotAPI.getChampionById(player.championId).id
						}));

						ctx.drawImage(champPic, 0, 0, picSize, picSize);
					ctx.restore();

					const sum1 = await canvasManager.load(`sum-spell-${player.spell1Id}`, riotAPI.spellImage(riotAPI.spellName(player.spell1Id)));
					const sum2 = await canvasManager.load(`sum-spell-${player.spell2Id}`, riotAPI.spellImage(riotAPI.spellName(player.spell2Id)));
					
					ctx.drawImage(sum1, (i===0)? -35 : picSize + 10, 0, 25, 25);
					ctx.drawImage(sum2, (i===0)? -35 : picSize + 10, 30, 25, 25);


					if(data.summoner.name === player.summonerName) ctx.fillStyle = 'a88b48';
					else ctx.fillStyle = '#ddd';
					ctx.fillText(player.summonerName, (i===0)? -50 : picSize + 50, picSize/2 + 8);
				ctx.restore();

				y += picSize + margin.y;
			}

			x = ctx.canvas.width / 2 + margin.x;
			y = 90;
			ctx.textAlign = 'left';

			banVec = 1;
			banX = ctx.canvas.width / 2 + 20;
		}

		ctx.font = '15px Roboto';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#bbb';

		ctx.fillText(pms(Date.now() - data.match.gameStartTime), ctx.canvas.width / 2, 25);
		
		ctx.fillStyle = '#ddd';
		ctx.font = '20px Roboto';

		ctx.fillText(riotAPI.gameType(data.match.gameQueueConfigId), ctx.canvas.width / 2, 55);

		const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `spectate_game-${data.summoner.name}-${data.summoner.region}.png`);

		message.channel.send('', attachment).catch(console.error);
	}

	get description() {
		return `Show basic informations about the current game of a player.`;
	}

	get usage() {
		return `spec summonerName`;
	}
}