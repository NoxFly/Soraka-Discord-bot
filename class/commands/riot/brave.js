const Discord = require('discord.js');
const Command = require('../../class.command.js');
const riotAPI = require('../../../index.js').App.riotAPI;
const Canvas = require('canvas');
const CanvasManager = require('../../../index.js').cvsManager;

module.exports = class Brave extends Command {
	sentences = {
		start: [
			"Looking for an amazing build...",
		],

		end: [
			"What do you think about this one ?", "1v9 build made for you to carry", "gg rep your team if lost", "better than hasagi build",
			"Better {lane} win bro"
		]
	};

    match(args) {
        return args.length < 2;
    }
    
    action(message, args) {
		let dis = this;
		message.channel.send(dis.sentences.start[random(0, dis.sentences.start.length)]).then(async function(msg) {
			// treatment

			// random champion
			let champion = null;
			if(args.length == 0) {
				let nChamp = Object.keys(riotAPI.champions).length;
				champion = Object.keys(riotAPI.champions)[random(0, nChamp)];
			} else {
				let i = Object.keys(riotAPI.champions).map(champ => champ.toLowerCase()).indexOf(args[0].toLowerCase());
				if(i !== -1) {
					champion = Object.keys(riotAPI.champions)[i];
				} else {
					msg.edit('Are you sure this champion exists ? :thinking:');
					return;
				}
			}


			// get items maxed
			let oMaxItems = riotAPI.maxItems;

			// separate boots / jungler items / others ones
			let maxItems = {boots: {}, jungle: {}, others: {}};
			for(let id of Object.keys(oMaxItems)) {
				if(oMaxItems[id].tags.indexOf('Boots') !== -1) maxItems.boots[id] = oMaxItems[id];
				else if(oMaxItems[id].tags.indexOf('Jungle') !== -1) maxItems.jungle[id] = oMaxItems[id];
				else maxItems.others[id] = oMaxItems[id];
			}

			// get sumSpells
			let sumSpells = Object.keys(riotAPI.sumSpells);
			sumSpells.splice(sumSpells.indexOf('SummonerSmite')); // can have smite only if position is jungle


			// random lane
			let position = riotAPI.lanes[random(0, 5)];

			// random summoner spells
			let r1 = position=='Jungle'? 'SummonerSmite' : sumSpells.splice(random(0, sumSpells.length), 1);
			let r2 = sumSpells.splice(random(0, sumSpells.length), 1);

			let spells = [
				riotAPI.spellImage(r1),
				riotAPI.spellImage(r2)
			];

			// random build
			// add boots
			let rBoots = Object.keys(maxItems.boots)[random(0, Object.keys(maxItems.boots).length)];
			let items = [maxItems.boots[rBoots]];
			items[0].id = rBoots;

			// add jungle item if position is jungle
			if(position == 'Jungle') {
				let rJng = Object.keys(maxItems.jungle)[random(0, Object.keys(maxItems.jungle).length)];
				items.push(maxItems.jungle[rJng]);
				items[1].id = rJng;
			}

			while(items.length < 6) {
				let id = Object.keys(maxItems.others)[random(0, Object.keys(maxItems.others).length)];

				// to not have 2 times the same item
				if(items.filter(item => item.id == id).length == 0) {
					items.push(maxItems.others[id]);
					items[items.length-1].id = id;
					delete maxItems.others[id];
				}
			}

			// output

			const canvas = Canvas.createCanvas(700, 250);
			const ctx = canvas.getContext('2d');
			Canvas.registerFont('./asset/fonts/BebasNeue-Regular.ttf', {family: 'BebasNeue'})
			ctx.font = '50px BebasNeue';

			// white background
			ctx.fillStyle = '#f2f8ff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// champion splash
			const splash = await CanvasManager.load(`champion_loading-${champion}`, riotAPI.format(riotAPI.url('championLoading'), {
				champion: riotAPI.champions[champion].id
			}));
			ctx.drawImage(splash, 15, 15, splash.width-17, splash.height-20, -10, -10, 160, 260);

			// champion name
			ctx.fillStyle = 'black';
			ctx.fillText(riotAPI.champions[champion].name, 170, 50);

			// items
			for(let i=0; i < 6; i++) {
				ctx.save();

				let x = 210 + i*80+10, y = 160, r = 35;

				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();

				let img = await CanvasManager.load(`item-${items[i].id}`, riotAPI.format(riotAPI.url('item'), {
					item: items[i].id,
					version: riotAPI.VERSIONS.dd
				}));
				ctx.drawImage(img, x-r, y-r, r*2, r*2);

				ctx.restore();
			}

			// lane
			const lane = await CanvasManager.load(`position-Challenger-${position}`, `./asset/positions/Position_Challenger-${position}.png`);
			ctx.drawImage(lane, 650, 10, 40, 40);

			// sumSpells
			const spell1 = await CanvasManager.load(`sum-spell-${spells[0]}`, spells[0]);
			const spell2 = await CanvasManager.load(`sum-spell-${spells[1]}`, spells[1]);
			ctx.drawImage(spell1, 20, 200, 40, 40);
			ctx.drawImage(spell2, 80, 200, 40, 40);



			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'ultimate-bravery.png');
			msg.edit(dis.sentences.end[random(0, dis.sentences.end.length)].replace('{lane}', riotAPI.lanes[random(0, 5)]));
			message.channel.send('', attachment);
		});
	}
	
	get description() {
		return `Get a random build for a [random] champion.`;
	}

	get usage() {
		return `brave {champion optional}`;
	}
}

const random = (min, max) => Math.floor(Math.random()*max-min)+min;