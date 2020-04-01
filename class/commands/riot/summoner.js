const Discord = require('discord.js');
const Canvas = require('canvas');

const Command = require('../../class.command.js');
const riotAPI = require('../../../index.js').App.riotAPI;
const CanvasManager = require('../../../index.js').cvsManager;

module.exports = class Summoner extends Command {
    match(args) {
        return [1, 2].indexOf(args.length) !== -1;
    }
    
    async action(message, [username, region]) {
		if(region !== undefined) region = region.toUpperCase();
		else region = riotAPI.region;

		if(!(region in riotAPI.REGIONS)) {
			let regions = '';
			for(let region of Object.keys(riotAPI.REGIONS)) regions += `\`${region.toLowerCase()}\` `;
			return message.channel.send('The region you wrote does not exists.\nRegions: '+regions);
		}

		let dis = this;

		message.channel.send('Recovering all data...').then(async function(msg) {
			let tp1 = Date.now();

			let summoner = await riotAPI.summoner(username, region);
			
			if(!summoner) return msg.edit('Any summoner with this username exists on this region.');
			
			let tp2 = Date.now();

			// output

			const canvas = Canvas.createCanvas(800, 600);
			const ctx = canvas.getContext('2d');
			Canvas.registerFont('./asset/fonts/BebasNeue-Regular.ttf', {family: 'BebasNeue'});
			Canvas.registerFont('./asset/fonts/Roboto-Thin.ttf', {family: 'Roboto'});
			
			ctx.font = '50px BebasNeue';
			ctx.textAlign = 'center';

			// background
			const background = await CanvasManager.load('fluid-background', './asset/fluid-background.jpg');
			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

			// separator line
			const sep = await CanvasManager.load('separator-thin', './asset/hextech/separator-thin.png');
			ctx.drawImage(sep, 0, 380, canvas.width-50, 30);

			let x = 130;
			let y = 120;
			let r = 60;
			let bannerWidth = 370;
			let bannerHeight = 400;
			let bannerName = summoner.league? `${summoner.league.tier.toLowerCase()}_banner` : 'unranked_banner';

			// banner
			const banner = await CanvasManager.load(`banner-${bannerName}`, `./asset/banners/${bannerName}.png`);
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

				const icon = await CanvasManager.load(`profileicon-${summoner.profileIconId}`, riotAPI.format(riotAPI.url('profileicon'), {
					version: riotAPI.VERSIONS.dd,
					iconId: summoner.profileIconId
				}));
				ctx.drawImage(icon, x-r, y-r, 2*r, 2*r);

			ctx.restore();

			if(summoner.league) {
				let lRank = summoner.league.tier.toLowerCase();
				let rankPath = `./asset/rank/${lRank}`;
				// summoner rank crest
				const prestige = await CanvasManager.load(`rank-crest-${lRank}`, `${rankPath}/${lRank}_base.png`);
				ctx.drawImage(prestige, x-(2*r+10), y-(2*r+10));

				let division = ['Master', 'Grandmaster', 'Challenger'].indexOf(summoner.league.rank)!==-1? '1' : riotAPI.divisions[summoner.league.rank];
				const prestigeDivision = await CanvasManager.load(`rank-division-${lRank}-${division}`, `${rankPath}/${lRank}_division${division}.png`);
				ctx.drawImage(prestigeDivision, x-65, y-(2*r-10));

				// summoner level
				ctx.fillStyle = '#ddd';
				ctx.font = '20px BebasNeue';
				ctx.textAlign = 'center';
				ctx.fillText(summoner.league.rank, x-1, y+69);

				// summoner level
				ctx.fillStyle = '#ddd';
				ctx.font = '20px BebasNeue';
				ctx.textAlign = 'right';
				ctx.fillText('level '+summoner.level, 790, 30);
				ctx.textAlign = 'center';
			} else {
				// summoner prestige level crest
				const prestige = await CanvasManager.load(`prestige-crest-lvl-${dis.getPrestigeLevel(summoner.level)}`, `./asset/prestige/prestige_crest_lvl_${dis.getPrestigeLevel(summoner.level)}.png`);
				ctx.drawImage(prestige, x-(2*r+10), y-(2*r+10));

				// summoner level
				ctx.fillStyle = '#ddd';
				ctx.font = '20px BebasNeue';
				ctx.textAlign = 'center';
				ctx.fillText(summoner.level, x-1, y+69);
			}

			// champion mastery
			let cx = 510, cy = 100;
			let fX = [cx-160, cx, cx+160];
			let fY = [cy+30, cy, cy+30];
			let fR = [45, 60, 45];
			let fM = [1, 0, 2];

			for(let i=0; i<3; i++) {
				let x = fX[i], y = fY[i], r = fR[i], m = summoner.mastery[fM[i]];

				// champion square
				ctx.save();
					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.clip();

					let image, imageName;

					if(m) {
						image = riotAPI.format(riotAPI.url('championSquare'), {
							version: riotAPI.VERSIONS.dd,
							champion: riotAPI.getChampionById(m.championId).id
						});
						imageName = 'champion-square'+riotAPI.getChampionById(m.championId).id;
					} else {
						image = './asset/no-icon.jpg';
						imageName = 'no-champion';
					}

					const champ1 = await CanvasManager.load(imageName, image);
					ctx.drawImage(champ1, x-r+5, y-r+5, r*2, r*2);
				ctx.restore();

				// champion level frame
				let lvl = (m && m.championLevel>3)?m.championLevel:'default';
				const frameChamp1 = await CanvasManager.load(`mastery-frame-${lvl}`, `./asset/mastery/rings/border_${lvl}.png`);
				ctx.drawImage(frameChamp1, x-1.5*r-10, y-1.5*r+5, r*3.5, r*3.5);

				if(m) {
					// champion points & champion names
					ctx.font = '25px Roboto';
					ctx.fillStyle = '#a88b48';

					ctx.fillText(riotAPI.getChampionById(m.championId).name, x, y+(i==1?140:110));
					ctx.font = '15px Roboto';
					ctx.fillText(formatNumber(m.championPoints), x, y+(i==1?160:130));
				}
			}

			ctx.font = '60px BebasNeue';
			ctx.fillText(summoner.masteryScore, cx, cy+240);
			ctx.font = '20px Roboto';
			ctx.fillText('total mastery score', cx, cy+270);



			// second part of the profile

			let xRank = 10, xLG = summoner.league? 360 : 10;

			const line = await CanvasManager.load('hextech-line-medium', './asset/hextech/hextech_line-medium.png');

			// winrate / Wins / losses / %
			if(summoner.league) {
				ctx.font = '25px Roboto';
				ctx.fillStyle = '#bbb';
				ctx.textAlign = 'center';
				ctx.fillText(summoner.league.leaguePoints+' LP', xRank+75, 500);
				
				ctx.font = '20px Roboto';
				ctx.textAlign = 'left';
				ctx.fillStyle = '#888';
				ctx.fillText(`${summoner.league.wins+summoner.league.losses} games`, xRank+170, 490);
				ctx.fillText(`${summoner.league.wins} wins`, xRank+170, 510);
				ctx.fillText(`${summoner.league.losses} losses`, xRank+170, 530);
				ctx.fillText(`${Math.round(summoner.league.wins*100/(summoner.league.wins+summoner.league.losses))}% winrate`, xRank+170, 550);

				const wr_frame = await CanvasManager.load('hextech-circle-small', './asset/hextech/hextech_circle-small.png');
				ctx.drawImage(wr_frame, xRank, 420, 150, 150);

				ctx.fillStyle = '#a88b48';
				ctx.fillText('Rank infos', xRank+175, 440);
				ctx.drawImage(line, xRank+150, 450, 150, 6);
			}
			
			// last game
			let lastGame = summoner.games[0];
			let participantId = riotAPI.findParticipantId(lastGame, summoner.id);
			let matchData = riotAPI.findParticipantData(lastGame, participantId);

			// champion circle
			const champLG = await CanvasManager.load(`champion-square-${matchData.championId}`, riotAPI.championSquare(riotAPI.getChampionById(matchData.championId).id));
			ctx.save();
				ctx.beginPath();
				ctx.arc(xLG+65, 496, 61, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(champLG, xLG, 430, 130, 130);
			ctx.restore();

			const last_game_frame = await CanvasManager.load('hextech-circle-medium', './asset/hextech/hextech_circle-medium.png');
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
			x = xIt, y = yIt;
			for(let i=0; i < 6; i++) {
				let img = await CanvasManager.load(`item-${matchData.stats['item'+i]}`, riotAPI.format(riotAPI.url('item'), {
					item: matchData.stats['item'+i],
					version: riotAPI.VERSIONS.dd
				}));
				ctx.drawImage(img, x, y, size, size);
				x += size + 4;
			}



			let tp3 = Date.now();

			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `summoner-${summoner.name}-${region}.png`);
			message.channel.send('', attachment).then(() => msg.delete());

			message.channel.send(`Elapsed time to recover remote data: ${t(tp1, tp2)}\nElapsed time to create the canvas: ${t(tp2, tp3)}\nTotal elapsed time: ${t(tp1, tp3)}`);
		});
	}

	getPrestigeLevel(level) {
		while(riotAPI.levels.indexOf(level)===-1 && level > 1) level--;
		return level;
	}
	
	get description() {
		return `Get infos about a summoner.`;
	}

	get usage() {
		return `summoner {summonerName} {region (optional)}`;
	}
}

function formatNumber(x) {
	x = x.toString();
	if(x.length > 3) x = x.substring(0, x.length-3) + '.' + x.substring(x.length-3);
	if(x.length > 7) x = x.substring(0, x.length-7) + ',' + x.substring(x.length-7);
	return x;
}

function t(start, end) {
	return `${Math.round((end - start) / 1000 * 100)/100}s`;
}