// it's only an object that stores every canvas image creation (width Canvas.loadImage)
const Canvas = require('canvas');

module.exports = class CanvasManager {
	constructor() {
		this.images = {};
	}

	async load(name, url) {
		if(!(name in this.images)) {
			this.images[name] = await Canvas.loadImage(url);
		}

		return this.images[name];
	}
}