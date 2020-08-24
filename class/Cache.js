const fs = require('file-system');


module.exports = class Cache {
	/**
	 * Create cache system manager
	 * @param {string} cachePath folder where it have to store cache
	 */
	constructor(cachePath) {
		this.path = cachePath;
		this.extFile = '.json';
	}

	/**
	 * recover cache file
	 * @param {string} url file to recover
	 * @param {boolean} json either it have to parse it in json
	 */
	get(url, json=true) {
		url = `${this.path}/${url}${this.extFile}`;

		if(fs.existsSync(url)) {
			let data = fs.readFileSync(url, 'utf8');
			
			data = json? JSON.parse(data) : data;

			return data;
		}

		return null;
	}

	/**
	 * Create cache file
	 * @param {string} url file to store in
	 * @param {string|object} data data to store in the file
	 */
	create(url, data) {
		if(typeof data == 'object') {
			data = JSON.stringify(data);
		}

		fs.writeFileSync(`${this.path}/${url}${this.extFile}`, data);
	}
}