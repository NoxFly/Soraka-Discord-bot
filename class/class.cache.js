const root = require('../index.js').root;
const fs = require('file-system');

module.exports = class Cache {
	constructor() {
		this.path = root+'/data/cache';
	}

	get(url, json=true) {
		url = `${this.path}/${url}`;
		if(fs.existsSync(url)) {
			let data = fs.readFileSync(url, 'utf8');
			data = json? JSON.parse(data) : data;
			return data;
		}
		return null;
	}

	create(url, data) {
		if(typeof data == 'object') data = JSON.stringify(data);
		fs.writeFileSync(`${this.path}/${url}`, data);
	}
}