const Discord = require('discord.js');
const Canvas = require('canvas');
require('canvas-5-polyfill');

const root = require('../../../index.js').root;
const riotAPI = require('../../../index.js').App.riotAPI;
const Command = require('../../class.command.js');
const CanvasManager = require('../../../index.js').cvsManager;


module.exports = class Rotation extends Command {
	match(args) {
		return args.length == 0;
	}

	action(message, args) {
		message.channel.send("Asking Runeterra who's in the rotation...").then(async function(msg) {
			let attachment;

			let rotation = await riotAPI.getRotation();			
			if(typeof rotation == 'object') {
				let rotationChampions = rotation.freeChampionIds;
				
				let canvas = Canvas.createCanvas(510, 150);
				let ctx = canvas.getContext('2d');

				// background
				const background = await CanvasManager.load(`fluid-background`, './asset/fluid-background.jpg');
				ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

				// default position of the 1st square at the top left corner & margin between each square
				let size = 50, margin = 10;
				let y = 20;


				let x = 20;
				for(let id of rotationChampions) {
					// small gradient for each square's border
					let gradient = ctx.createLinearGradient(x, y, x+size, y+size);
					gradient.addColorStop(0, '#a88b48');
					gradient.addColorStop(1, '#deb887');

					ctx.fillStyle = gradient;
					ctx.fillRect(x, y, size, size);

					// square
					let championId = riotAPI.getChampionById(id).id;
					let img = await CanvasManager.load(`champion-square-${championId}`, riotAPI.championSquare(championId));
					ctx.drawImage(img, x+1, y+1, size-2, size-2);

					// move x;y
					x += size + margin;
					if(x+size > 520) {
						x = 20;
						y += size + margin;
					}
				}

				// cache
				riotAPI.cache.create('rotation/champion-rotation.png', canvas.toBuffer());

				attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'champion-rotation.png');
			} else {
				attachment = {files: [root+'/data/cache/rotation/champion-rotation.png']};
			}
			
			message.channel.send('', attachment).then(() => msg.delete());
		});
	}

	get description() {
		return `Shows the champion rotation of the week. Reset all Tuesday at 2am.`;
	}

	get usage() {
		return `rotation`;
	}
}