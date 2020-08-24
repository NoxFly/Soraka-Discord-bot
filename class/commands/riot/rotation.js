const Discord = require('discord.js');
const Canvas = require('canvas');
require('canvas-5-polyfill');

const Command = require('../../Command');


module.exports = class Rotation extends Command {
	match(client, message, args) {
		return args.length == 0;
	}

	action(client, message, args) {
		message.channel.send("Asking Runeterra who's in the rotation...").then(async msg => {
			let attachment;

			const rotation = await client.riotAPI.getRotation();

			if(typeof rotation == 'object') {
				const rotationChampions = rotation.freeChampionIds;
				
				const canvas = Canvas.createCanvas(510, 150);
				const ctx = canvas.getContext('2d');

				// background
				const background = await client.canvasManager.load(`fluid-background`, './asset/fluid-background.jpg');
				ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

				// default position of the 1st square at the top left corner & margin between each square
				let size = 50, margin = 10;
				let y = 20;
				let x = 20;

				for(const id of rotationChampions) {
					// small gradient for each square's border
					const gradient = ctx.createLinearGradient(x, y, x+size, y+size);
					gradient.addColorStop(0, '#a88b48');
					gradient.addColorStop(1, '#deb887');

					ctx.fillStyle = gradient;
					ctx.fillRect(x, y, size, size);

					// square
					const championId = client.riotAPI.getChampionById(id)?.id;
					const img = await client.canvasManager.load(`champion-square-${championId}`, client.riotAPI.championSquare(championId));
					
					ctx.drawImage(img, x+1, y+1, size-2, size-2);

					// move x;y
					x += size + margin;

					if(x + size > 520) {
						x = 20;
						y += size + margin;
					}
				}

				// cache
				client.riotAPI.cache.create('rotation/champion-rotation.png', canvas.toBuffer());

				attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'champion-rotation.png');
			}
			
			// already in cache and same rotation's week
			else {
				attachment = {files: [client.root+'/data/cache/rotation/champion-rotation.png']};
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