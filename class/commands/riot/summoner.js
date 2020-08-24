const Discord = require('discord.js');
const Canvas = require('canvas');

const Command = require('../../Command');

Canvas.registerFont(`./asset/fonts/BebasNeue-Regular.ttf`, {family: 'BebasNeue'});
Canvas.registerFont(`./asset/fonts/Roboto-Light.ttf`, {family: 'Roboto'});

module.exports = class Summoner extends Command {

	constructor(client) {
		super();

		this.createDefaultCanvas(client);

	}

	async createDefaultCanvas(client) {
		this.defaultCanvas = Canvas.createCanvas(800, 600);
		const ctx = this.defaultCanvas.getContext('2d');

		// background
		const background = await client.canvasManager.load('fluid-background', `${client.root + client.paths.asset}/fluid-background.jpg`);
		ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);

		// separator line
		const sep = await client.canvasManager.load('separator-thin', `${client.root + client.paths.asset}/hextech/separator-thin.png`);
		ctx.drawImage(sep, 0, 380, ctx.canvas.width-50, 30);

		
	}

	match(client, message, args) {
        return [1, 2].includes(args.length);
    }
    
    async action(client, message, [username, region]) {
		
		// select region
		if(region !== undefined) region = region.toUpperCase();
		else region = client.riotAPI.region;

		
		
		
		
		// unknown region
		if(!(region in client.riotAPI.REGIONS)) {
			let regions = Object.keys(client.riotAPI.REGIONS).map(r => `\`${r.toLowerCase()}\` `);

			return message.channel.send(`The region you wrote does not exists.\nRegions: ${regions}`);
		}



		//
		message.channel.send('Recovering all data...').then(async msg => {
			let tp1 = Date.now();

			let summoner = await client.riotAPI.summoner(username, region);
			
			if(!summoner) {
				return msg.edit('Any summoner with this username exists on this region.');
			}
			
			let tp2 = Date.now();

			// output

			const canvas = Canvas.createCanvas(800, 600);
			const ctx = canvas.getContext('2d');

			ctx.drawImage(this.defaultCanvas, 0, 0);
			
			ctx.textAlign = 'center';

			
			await this.drawRankBanner(client, ctx, summoner);


			await this.drawChampionMasteries(client, ctx, summoner);
 
			
			await this.drawRankInfos(client, ctx, summoner);


			await this.drawLastGame(client, ctx, summoner);
			

			let tp3 = Date.now();

			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `summoner-${summoner.name}-${region}.png`);
			message.channel.send('', attachment).then(() => msg.delete()).catch(console.error);

			//message.channel.send(`Elapsed time to recover remote datas: ${t(tp1, tp2)}\nElapsed time to create the canvas: ${t(tp2, tp3)}\nTotal elapsed time: ${t(tp1, tp3)}`);
		})
		.catch(console.error);
	}

	getPrestigeLevel(riotAPI, level) {
		while(!riotAPI.levels.includes(level) && level > 1) level--;
		return level;
	}

	async drawRankBanner(client, ctx, summoner) {
		let x = 130;
		let y = 120;
		let r = 60;

		const bannerWidth = 370;
		const bannerHeight = 400;
		const bannerName = summoner.league? `${summoner.league.tier.toLowerCase()}_banner` : 'unranked_banner';

		// banner
		const banner = await client.canvasManager.load(`banner-${bannerName}`, `${client.root + client.paths.asset}/banners/${bannerName}.png`);
		ctx.drawImage(banner, x-bannerWidth/2, 0, bannerWidth, bannerHeight);

		

		// summoner name
		ctx.fillStyle = '#a88b48';
		ctx.font = '30px BebasNeue';
		ctx.fillText(summoner.name, x, 250);

		// summoner profile icon
		ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();

			const icon = await client.canvasManager.load(`profileicon-${summoner.profileIconId}`, client.riotAPI.format(client.riotAPI.url('profileicon'), {
				version: client.riotAPI.VERSIONS.dd,
				iconId: summoner.profileIconId
			}));

			ctx.drawImage(icon, x - r, y - r, 2 * r, 2 * r);

		ctx.restore();


		// ranked
		if(summoner.league) {
			const lRank = summoner.league.tier.toLowerCase();
			const rankPath = `./asset/rank/${lRank}`;

			// summoner rank crest
			const prestige = await client.canvasManager.load(`rank-crest-${lRank}`, `${rankPath}/${lRank}_base.png`);
			ctx.drawImage(prestige, x - (2 * r + 10), y - (2 * r + 10));

			const division = ['Master', 'Grandmaster', 'Challenger'].includes(summoner.league.rank)? '1' : client.riotAPI.divisions[summoner.league.rank];
			const prestigeDivision = await client.canvasManager.load(`rank-division-${lRank}-${division}`, `${rankPath}/${lRank}_division${division}.png`);
			
			ctx.drawImage(prestigeDivision, x - 65, y - 1.7 * r);

			// summoner rank
			ctx.fillStyle = '#ddd';
			ctx.font = '20px BebasNeue';
			ctx.textAlign = 'center';
			ctx.fillText(summoner.league.rank, x-1, y+69);

			// summoner level
			ctx.fillStyle = '#ddd';
			ctx.font = '20px BebasNeue';
			ctx.textAlign = 'right';
			ctx.fillText(`level ${summoner.level}`, 790, 30);
			ctx.fillText(summoner.region.toUpperCase(), 790, 55);
			ctx.textAlign = 'center';
		}
		
		// level - not ranked
		else {
			// summoner prestige level crest
			const prestigeLevel = this.getPrestigeLevel(client.riotAPI, summoner.level);
			const prestige = await client.canvasManager.load(`prestige-crest-lvl-${prestigeLevel}`, `./asset/prestige/prestige_crest_lvl_${prestigeLevel}.png`);
			ctx.drawImage(prestige, x - (2 * r + 10), y - (2 * r + 10));

			// summoner level
			ctx.fillStyle = '#ddd';
			ctx.font = '20px BebasNeue';
			ctx.textAlign = 'center';
			ctx.fillText(summoner.level, x-1, y+69);

			ctx.fillStyle = '#ddd';
			ctx.font = '20px BebasNeue';
			ctx.textAlign = 'right';
			ctx.fillText(summoner.region.toUpperCase(), 790, 30);

			ctx.textAlign = 'center';
		}
	}
	




	async drawChampionMasteries(client, ctx, summoner) {
		// champion mastery
		const cx = 510, cy = 100;
		const fX = [cx-160, cx, cx+160];
		const fY = [cy+30, cy, cy+30];
		const fR = [45, 60, 45];
		const fM = [1, 0, 2];

		for(let i=0; i < 3; i++) {
			const x = fX[i],
				y = fY[i],
				r = fR[i],
				m = summoner.mastery[fM[i]];

			// champion square
			ctx.save();
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();

				let image, imageName;

				if(m) {
					image = client.riotAPI.format(client.riotAPI.url('championSquare'), {
						version: client.riotAPI.VERSIONS.dd,
						champion: client.riotAPI.getChampionById(m.championId).id
					});

					imageName = 'champion-square'+client.riotAPI.getChampionById(m.championId).id;
				}
				
				else {
					image = `${client.root + client.paths.asset}/no-icon.jpg`;
					imageName = 'no-champion';
				}

				const champ1 = await client.canvasManager.load(imageName, image);
				ctx.drawImage(champ1, x - r, y - r, r * 2, r * 2);
			ctx.restore();


			if(m) {
				// champion level frame
				let lvl = m.championLevel;

				if(lvl > 0) {
					const frameChamp1 = await client.canvasManager.load(`mastery-frame-${lvl}`, `${client.root + client.paths.asset}/mastery/banners/mastery_${lvl}.png`);
					ctx.drawImage(frameChamp1, x - r/2, y + r - 3, r, r);
				}

				const ring = await client.canvasManager.load(`mastery-ring`, `${client.root + client.paths.asset}/mastery/rings/border_default.png`);
				ctx.drawImage(ring, x - r*1.1, y - r*1.1, r * 2.2, r * 2.2);
			
				// champion points & champion names
				ctx.fillStyle = '#a88b48';
				
				ctx.font = '25px Roboto';
				ctx.fillText(client.riotAPI.getChampionById(m.championId).name, x, y + (i==1? 150 : 120));
				
				ctx.font = '15px Roboto';
				ctx.fillText(formatNumber(m.championPoints), x, y + (i==1? 170 : 140));
			}
		}

		ctx.font = '60px BebasNeue';
		ctx.fillText(summoner.masteryScore, cx, cy + 240);

		ctx.font = '20px Roboto';
		ctx.fillText('total mastery score', cx, cy + 270);
	}








	async drawRankInfos(client, ctx, summoner) {
		let xRank = 10;

		const line = await client.canvasManager.load('hextech-line-medium', `${client.root + client.paths.asset}/hextech/hextech_line-medium.png`);

		// winrate / Wins / losses / %
		if(summoner.league) {
			ctx.font = '25px BebasNeue';
			ctx.fillStyle = '#bbb';
			ctx.textAlign = 'center';

			ctx.fillText(summoner.league.leaguePoints+' LP', xRank+75, 490);

			ctx.font = '17px BebasNeue';
			
			ctx.fillText(`${summoner.league.tier.toLowerCase()} ${summoner.league.rank}`, xRank+75, 510);
			

			ctx.font = '20px Roboto';
			ctx.textAlign = 'left';
			ctx.fillStyle = '#888';

			ctx.fillText(`${summoner.league.wins+summoner.league.losses} games`, xRank+170, 490);
			ctx.fillText(`${summoner.league.wins} wins`, xRank+170, 510);
			ctx.fillText(`${summoner.league.losses} losses`, xRank+170, 530);
			ctx.fillText(`${Math.round(summoner.league.wins*100/(summoner.league.wins+summoner.league.losses))}% winrate`, xRank+170, 550);


			const wr_frame = await client.canvasManager.load('hextech-circle-small', `${client.root + client.paths.asset}/hextech/hextech_circle-small.png`);
			ctx.drawImage(wr_frame, xRank, 420, 150, 150);


			ctx.fillStyle = '#a88b48';

			ctx.fillText('Rank infos', xRank+175, 440);
			ctx.drawImage(line, xRank+150, 450, 150, 6);
		}
	}






	async drawLastGame(client, ctx, summoner) {
		// last game
		const xLG = summoner.league? 360 : 10;
		
		let lastGame = summoner.games[0];
		let participantId = client.riotAPI.findParticipantId(lastGame, summoner.id);
		let matchData = client.riotAPI.findParticipantData(lastGame, participantId);

		const line = await client.canvasManager.load('hextech-line-medium', `${client.root + client.paths.asset}/hextech/hextech_line-medium.png`);

		// champion circle
		const champLG = await client.canvasManager.load(`champion-square-${matchData.championId}`, client.riotAPI.championSquare(client.riotAPI.getChampionById(matchData.championId).id));
		
		ctx.save();
			ctx.beginPath();
			ctx.arc(xLG+65, 496, 61, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(champLG, xLG, 430, 130, 130);
		ctx.restore();

		const last_game_frame = await client.canvasManager.load('hextech-circle-medium', `${client.root + client.paths.asset}/hextech/hextech_circle-medium.png`);
		ctx.drawImage(last_game_frame, xLG, 430, 130, 130);

		// title
		ctx.textAlign = 'left';
		ctx.fillText('Last game', xLG+180, 440);
		ctx.drawImage(line, xLG+150, 450, 150, 6);

		// infos
		ctx.fillStyle = '#aaa';
		ctx.font = '17px Roboto';
		ctx.fillText(`Game mode: ${lastGame.gameMode}`, xLG+160, 480);
		ctx.fillText(`Game result: ${matchData.stats.win?'Victory':'Defeat'}`, xLG+160, 500);
		ctx.fillText(`kda: ${matchData.stats.kills}/${matchData.stats.deaths}/${matchData.stats.assists}`, xLG+160, 520);

		// level
		ctx.fillStyle = '#000';
		ctx.strokeStyle = matchData.stats.win? '#77b255': '#d3373a';
		ctx.lineWidth = '1px';
		ctx.beginPath();
			ctx.arc(xLG+110, 530, 20, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = '#ddd';
		ctx.textAlign = 'center';
		ctx.fillText(matchData.stats.champLevel, xLG+111, 536);
		

		// build
		ctx.fillStyle = 'red';

		let size = 35;
		let xIt = xLG+160, yIt = 540;

		let x = xIt, y = yIt;

		for(let i=0; i < 6; i++) {
			const itemUrl = client.riotAPI.format(client.riotAPI.url('item'), {
				item: matchData.stats['item'+i],
				version: client.riotAPI.VERSIONS.dd
			});

			if(matchData.stats['item'+i] !== 0) {
				let img = await client.canvasManager.load(`item-${matchData.stats['item'+i]}`, itemUrl);

				ctx.drawImage(img, x, y, size, size);
			}
			
			x += size + 4;
		}
	}









	get description() {
		return `Get infos about a summoner.`;
	}

	get usage() {
		return `summoner {summonerName (without spaces)} {region (optional)}`;
	}
}

const formatNumber = x => {
	x = x.toString();
	if(x.length > 3) x = x.substring(0, x.length-3) + '.' + x.substring(x.length-3);
	if(x.length > 7) x = x.substring(0, x.length-7) + ',' + x.substring(x.length-7);
	return x;
};

const t = (start, end) => `${Math.round((end - start) / 1000 * 100)/100}s`;