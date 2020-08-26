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

			msg.edit("This player is in game, let me retrieve details of every players who are in this game...");

			
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

		ctx.strokeStyle = '#785a28';
		ctx.fillStyle = 'none';
		
		ctx.beginPath();
			ctx.moveTo(ctx.canvas.width / 2 - 150, 0);
			ctx.lineTo(ctx.canvas.width / 2 - 70, 70);
			ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
			ctx.moveTo(ctx.canvas.width / 2 + 150, 0);
			ctx.lineTo(ctx.canvas.width / 2 + 70, 70);
			ctx.stroke();
		ctx.closePath();

		ctx.globalAlpha = 1;




		let picSize = 50;
		let margin = {x: 20, y: 20};
		let x = ctx.canvas.width / 2 - picSize - margin.x;
		let y = 90;

		let banX = ctx.canvas.width / 2 - 190;
		let banVec = -1;

		ctx.textAlign = 'right';
		ctx.font = '17px Roboto';

		const rPart = data.match.participants.length / 2;

		console.log(data.match);


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


						const champPic = await canvasManager.load(`champion-square-${riotAPI.getChampionById(player.championId).id}`, riotAPI.championSquare(riotAPI.getChampionById(player.championId)?.id));

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





				// ban
				if(data.match.bannedChampions.length > 0) {
					ctx.lineWidth = 1;
					ctx.globalAlpha = 0.5;
					ctx.strokeRect(banX, 20, 30, 30);
					ctx.globalAlpha = 0.8;

					const bannedChampionId = riotAPI.getChampionById(data.match.bannedChampions.find(ban => ban.pickTurn-1 === j + i*rPart).championId)?.id;
					let bannedChampion;

					if(bannedChampionId) {
						bannedChampion = await canvasManager.load(`champion-square-${bannedChampionId}`, riotAPI.championSquare(bannedChampionId));
					} else {
						bannedChampion = await canvasManager.load(`no-icon`, './asset/no-icon.jpg');
					}

					ctx.drawImage(bannedChampion, banX+1, 21, 28, 28);

					ctx.globalAlpha = 1;
				}



				banX += banVec * 35;




				y += picSize + margin.y;
			}

			x = ctx.canvas.width / 2 + margin.x;
			y = 90;
			ctx.textAlign = 'left';

			banVec = 1;
			banX = ctx.canvas.width / 2 + 160;
		}

		ctx.font = '15px Roboto';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#bbb';

		ctx.fillText(pms(Date.now() - data.match.gameStartTime), ctx.canvas.width / 2, 25);
		
		ctx.fillStyle = '#ddd';
		ctx.font = '20px Roboto';

		ctx.fillText(riotAPI.gameType(data.match.gameQueueConfigId), ctx.canvas.width / 2, 55);





		ctx.beginPath();
			ctx.fillStyle = '#1c4764';
			ctx.arc(0, 35, 10, -Math.PI/2, Math.PI / 2);
			ctx.fill();
		ctx.closePath();

		ctx.beginPath();
			ctx.fillStyle = '#592927';
			ctx.arc(ctx.canvas.width, 35, 10, Math.PI/2, -Math.PI / 2);
			ctx.fill();
		ctx.closePath();












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