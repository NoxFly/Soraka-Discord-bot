// it's only an object that stores every canvas image creation (width Canvas.loadImage)
const Canvas = require('canvas');


module.exports = class CanvasManager {
	/**
	 * Create canvas image manager. Stores images once it has loaded them.
	 */
	constructor() {
		this.images = {};
	}

	/**
	 * Loads / store / return an image
	 * @param {string} name image name - key
	 * @param {string} url image path - value
	 */
	async load(name, url) {
		if(!(name in this.images)) {
			this.images[name] = await Canvas.loadImage(url);
		}

		return this.images[name];
	}
}