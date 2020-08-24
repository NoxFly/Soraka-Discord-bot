const Discord = require('discord.js');
const Command = require('../../Command');
const Canvas = require('canvas');

Canvas.registerFont(`./asset/fonts/BebasNeue-Regular.ttf`, {family: 'BebasNeue'});


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



    match(client, message, args) {
        return args.length < 2 || (args.length === 2 && args[0] === '-r');
    }
    
    action({ riotAPI, canvasManager }, message, args) {
		const r = random(0, this.sentences.start.length);

		message.channel.send(this.sentences.start[r]).then(async msg => {
			// treatment

			// random champion
			const champion = this.randomChampion(msg, riotAPI, args);

			if(!champion) return;

			
			// random lane
			const position = riotAPI.lanes[random(0, 5)];

			
			// get items maxed
			const items = this.randomItems(riotAPI, position);
			
			
			// get sumSpells
			const spells = this.randomSumSpells(riotAPI, position);


			// get runes
			const runes = (args[0] === '-r')? this.randomRunes(riotAPI) : [];


			
			msg.edit(this.sentences.start[r] + '\nGenerating the canvas...');

			// output
			this.draw({riotAPI, canvasManager}, msg, champion, spells, items, runes, position);
			
		});
	}
	


	randomChampion(msg, riotAPI, args) {
		let champion = null;

		// random champion
		if(args.length == 0 || args[0] === '-r') {
			let nChamp = Object.keys(riotAPI.champions).length;
			champion = Object.keys(riotAPI.champions)[random(0, nChamp)];
		}
		
		// with given champion
		else {
			let c = (args.length === 2)? args[1] : args[0];

			let i = Object.keys(riotAPI.champions).map(champ => champ.toLowerCase()).indexOf(c.toLowerCase());
			
			// champion exists
			if(i !== -1) {
				champion = Object.keys(riotAPI.champions)[i];
			}
			
			// champion does not exist
			else {
				msg.edit('Are you sure this champion exists ? :thinking:');
				return null;
			}
		}

		return champion;
	}




	randomSumSpells(riotAPI, position) {
		let sumSpells = Object.keys(riotAPI.sumSpells);
		sumSpells.splice(sumSpells.indexOf('SummonerSmite')); // can have smite only if position is jungle

		// random summoner spells
		let r1 = (position=='Jungle')? 'SummonerSmite' : sumSpells.splice(random(0, sumSpells.length), 1);
		let r2 = sumSpells.splice(random(0, sumSpells.length), 1);

		return [
			riotAPI.spellImage(r1),
			riotAPI.spellImage(r2)
		];
	}




	randomItems(riotAPI, position) {
		const oMaxItems = riotAPI.maxItems;

		// separate boots / jungler items / others ones
		const maxItems = {boots: {}, jungle: {}, others: {}};

		// for each items, separate them
		for(const id of Object.keys(oMaxItems)) {
			if(oMaxItems[id].tags.includes('Boots')) {
				maxItems.boots[id] = oMaxItems[id];
			}
			
			else if(oMaxItems[id].tags.includes('Jungle')) {
				maxItems.jungle[id] = oMaxItems[id];
			}

			else {
				maxItems.others[id] = oMaxItems[id];
			}
		}

		// random build
		// add boots
		let rBoots = Object.keys(maxItems.boots)[random(0, Object.keys(maxItems.boots).length)];
		let items = [maxItems.boots[rBoots]];
		items[0].id = rBoots;

		// add jungle item if position is jungle
		if(position == 'Jungle') {
			const rJng = Object.keys(maxItems.jungle)[random(0, Object.keys(maxItems.jungle).length)];
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

		return items;
	}




	randomRunes(riotAPI) {
		let runes = [];

		let riotRunes = riotAPI.getFundamentalRunes();

		for(let i=0; i < 2; i++) {
			let perk = riotRunes.splice(random(0, riotRunes.length), 1)[0];

			perk.slots = riotAPI.getSlotsRunes(perk.key).map(slot => slot.runes[random(0, slot.runes.length-1)]);

			runes.push(perk);
		}

		return runes;
	}




	async draw({ riotAPI, canvasManager }, msg, champion, spells, items, runes, position) {
		const canvas = Canvas.createCanvas(700, 250);
		const ctx = canvas.getContext('2d');

		ctx.font = '50px BebasNeue';

		// white background
		ctx.fillStyle = '#f2f8ff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// champion splash
		const splash = await canvasManager.load(`champion_loading-${champion}`, riotAPI.format(riotAPI.url('championLoading'), {
			champion: riotAPI.champions[champion].id
		}));

		
		ctx.drawImage(splash, 15, 15, splash.width-17, splash.height-20, -10, -10, 160, 260);
		
		/* 
		const splashBg = await canvasManager.load(`fluid-background`, `./asset/fluid-background.jpg`);
		const ratioBg = 550 / splashBg.width;
		ctx.drawImage(splashBg, 0, 0, splashBg.width, splashBg.height, 150, 0, 550, splashBg.height * ratioBg);
		*/


		
		
		
		// champion name
		ctx.fillStyle = 'black';
		ctx.fillText(riotAPI.champions[champion].name, 170, 50);

		// lane
		const lane = await canvasManager.load(`position-Challenger-${position}`, `./asset/positions/Position_Challenger-${position}.png`);
		ctx.drawImage(lane, 650, 10, 40, 40);

		// sumSpells
		const spell1 = await canvasManager.load(`sum-spell-${spells[0]}`, spells[0]);
		const spell2 = await canvasManager.load(`sum-spell-${spells[1]}`, spells[1]);
		ctx.drawImage(spell1, 20, 200, 40, 40);
		ctx.drawImage(spell2, 80, 200, 40, 40);


		// without runes
		if(runes.length === 0) {
			// items
			for(let i=0; i < 6; i++) {
				ctx.save();

				let x = 210 + i*80+10, y = 160, r = 35;

				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();

				let img = await canvasManager.load(`item-${items[i].id}`, riotAPI.format(riotAPI.url('item'), {
					item: items[i].id,
					version: riotAPI.VERSIONS.dd
				}));
				ctx.drawImage(img, x-r, y-r, r*2, r*2);

				ctx.restore();
			}
		}
		
		// with runes
		else {
			// runes
			const xR = 200;
			const yR = 70;
			const s = 40;

			let x = 0, y = 0;

			for(const rune of runes) {
				ctx.save();
					let img = await canvasManager.load(`perk-${rune.id}`, riotAPI.perkIcon(rune.icon));

					ctx.drawImage(img, xR+x, yR+y, s, s);

				ctx.restore();

				for(const perk of rune.slots) {
					y += s + 5;

					img = await canvasManager.load(`perk-${perk.id}`, riotAPI.perkIcon(perk.icon));

					ctx.drawImage(img, xR+x, yR+y, s, s);
				}

				x += 4 * s;
				y = 0;
			}


			// items
			const xI = 520;
			const yI = 128;
			const r = 25;

			x = 0, y = 0;

			for(let i=0; i < 6; i++) {
				if(i === 3) {
					x = 0;
					y += r * 2 + 5;
				}

				ctx.save();

					ctx.beginPath();
					ctx.arc(xI + x, yI + y, r, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.clip();

					let img = await canvasManager.load(`item-${items[i].id}`, riotAPI.format(riotAPI.url('item'), {
						item: items[i].id,
						version: riotAPI.VERSIONS.dd
					}));

					ctx.drawImage(img, xI+x-r, yI+y-r, r*2, r*2);

				ctx.restore();

				x += r * 2 + 5;
			}
		}



		const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'ultimate-bravery.png');
		msg.edit(this.sentences.end[random(0, this.sentences.end.length)].replace('{lane}', riotAPI.lanes[random(0, 5)]));
		msg.channel.send('', attachment);
	}






	get description() {
		return `Get a random build for a [random] champion.`;
	}

	get usage() {
		return `brave {-r (optional)} {champion (optional)}`;
	}
}

const random = (min, max) => Math.floor(Math.random() * max - min) + min;