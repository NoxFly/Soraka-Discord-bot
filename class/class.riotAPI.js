const fetch = require('node-fetch');
const fs = require('file-system');
const conf = require('../_conf/config.js').riot;
const root = require('../index.js').root;
const cacheSystem = require('./class.cache.js');
const md5 = require('md5');

module.exports = class RiotAPI {
	constructor() {
		this.apiKey = conf.apiKey;
		this.lang = 'us';
		this.region = 'EUW';
		this.consts = require('../_conf/riotConsts.json');

		this.champions = this.items = this.sumSpells = {};

		this.levels = [1, 30, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500];
		this.divisions = {I: '1', II: '2', III: '3', IV: '4'};
		this.lanes = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'];

		this.cache = new cacheSystem();

		this.loadPrerequires();
	}

	get URLS() {return this.consts.URLS;}
	get REGIONS() {return this.consts.REGIONS;}
	get LANGS() {return this.consts.LANGS;}
	get VERSIONS() {return this.consts.VERSIONS;}

	format(url, obj) {
		let matches = url.match(/\{[a-zA-Z]+\}/g);
		if(!matches) return url;
		for(let m of matches) {
			if(m.replace(/(\{|\})+/g, '') in obj) url = url.replace(m, obj[m.replace(/(\{|\})+/g, '')]);
		}
		return url;
	}

	url(key) {
		for(let domain of Object.keys(this.URLS)) {
			if(key in this.URLS[domain].url) return this.URLS[domain].base + this.URLS[domain].url[key];
		}
	}


	// champions & items & spells
	
	champion(name) {
		return this.format(this.URLS.base, {});
	}

	getSplash(champion, n=0) {
		return this.format(this.url('championSplash'), {
			champion: champion,
			n: n
		});
	}

	championSquare(id) {
		return this.format(this.url('championSquare'), {
			champion: id,
			version: this.VERSIONS.dd
		});
	}

	spellImage(spell) {
		return this.format(this.url('summonerSpell'), {
			version: this.VERSIONS.dd,
			spell: spell
		});
	}

	getChampionById(id) {
		let obj = Object.filter(this.champions, (i, champion) => champion.key == id);
		if(Object.keys(obj).length == 1) return obj[Object.keys(obj)[0]];
		return undefined;
	}

	async getRotation(region=this.region) {
		let lastRefresh = this.cache.get('rotation/rotation.json');
		if(!lastRefresh) lastRefresh = 0;
		else lastRefresh = lastRefresh.lastRefresh;

		let d = new Date();
		let now = Date.now();

		let img = `${root}/data/cache/rotation/champion-rotation.png`;
		if(!fs.existsSync(img) || (d.getDay() == 2 && d.getHours() >= 2 && now-lastRefresh > 90000000)) {
			// not cached or need to refresh
			let rotation = await fetch(this.format(this.url('championRotation'), {
				region: this.REGIONS[region],
				version: this.VERSIONS.rotation
			})+this.api_key).then(data => data.json()).catch(error => console.log(error));

			this.cache.create('rotation/rotation.json', {lastRefresh: now});

			return rotation;
		}

		// get the cache
		return img;
	}

	get maxItems() {
		return Object.filter(this.items, (id, item) => (!item.hasOwnProperty('into') && item.tags.indexOf('Consumable') === -1 && item.tags.indexOf('Trinket') === -1 && (item.gold.total > 1000 || item.tags.indexOf('Boots')!==-1)) || (id != '3801' && 'into' in item && !(this.items.hasOwnProperty(item.into[0]))));
	}

	get api_key() {
		return '?api_key='+this.apiKey;
	}


	// summoner

	async summoner(name, region, image=false) {
		// get basic summoner data
		let summoner = await fetch(this.format(this.url('summonerByName'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.summoner,
			name: name
		})+this.api_key)
		.then(res => res.json())
		.then(summoner => {return {id: summoner.id, name: summoner.name, profileIconId: summoner.profileIconId, level: summoner.summonerLevel, accountId: summoner.accountId}})
		.catch(error => console.log(error));

		// can't find the summoner
		if(!summoner.id) return null;

		// cached data
		let data = this.cache.get(`players/${region}/${md5(summoner.id)}.json`);
		let matches = (await this.summonerMatchList(summoner.accountId, region)).matches.splice(0, 3);
		let modified = false;

		if(!data || matches[0].gameId != data.games[0].gameId) {
			data = JSON.parse(JSON.stringify(summoner));

			// not cache file : create one
			let rank = (await this.summonerRank(summoner.id, region)).filter(league => /SOLO/.test(league.queueType));
			data.league = rank.length==1? rank[0] : null;

			let mastery = await this.summonerMastery(summoner.id, region);
			data.mastery = mastery.splice(0, 3);

			data.masteryScore = await this.summonerMasteryScore(summoner.id, region);

			for(let i in matches)
				matches[i] = await this.summonerMatch(matches[i].gameId, region);

			data.games = matches;

			modified = true;
		}
		
		else {
			if(image) return `${root}/data/cache/players/${region}/images/${md5(summoner.id)}.png`;
			
			// watch if he played. If yes, then we need to refresh all data.
			// if he didn't played, it means nothing changed (mastery, xp/level)
		}

		// refresh the cache file if some data has been modified
		if(modified) this.cache.create(`players/${region}/${md5(summoner.id)}.json`, data);

		return data;
	}

	async summonerRank(id, region) {
		return await fetch(this.format(this.url('league'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.league,
			encryptedSummonerId: id
		})+this.api_key)
		.then(league => league.json())
		.catch(error => console.log(error));
	}

	async summonerMastery(id, region) {
		return await fetch(this.format(this.url('championMasteries'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.mastery,
			encryptedSummonerId: id
		})+this.api_key)
		.then(mastery => mastery.json())
		.catch(error => console.log(error));
	}

	async summonerMasteryScore(id, region) {
		return await fetch(this.format(this.url('championMasteryScore'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.mastery,
			encryptedSummonerId: id
		})+this.api_key)
		.then(mastery => mastery.json())
		.catch(error => console.log(error));
	}

	async summonerMatchList(id, region) {
		return await fetch(this.format(this.url('summonerMatchlist'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.match,
			encryptedAccountId: id
		})+this.api_key)
		.then(matchlist => matchlist.json())
		.catch(error => console.log(error));
	}

	async summonerMatch(matchId, region) {
		return await fetch(this.format(this.url('match'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.match,
			matchId: matchId
		})+this.api_key)
		.then(match => match.json())
		.catch(error => console.log(error));
	}

	findParticipantId(match, summonerId) {
		let part = match.participantIdentities;
		let i = 0;
		while(part[i].player.summonerId != summonerId && i < 9) {
			i++;
		}
		return part[i].participantId;
	}

	findParticipantData(match, participantId) {
		let i = 0;
		while(match.participants[i].participantId != participantId && i < 9) {
			i++;
		}
		return match.participants[i];
	}





	// pre-requires
	loadPrerequires() {

		let championsUrl = this.format(this.url('champions'), {
			version: this.VERSIONS.dd,
			lang: this.LANGS[this.lang]
		});

		let itemsUrl = this.format(this.url('items'), {
			version: this.VERSIONS.dd,
			lang: this.LANGS[this.lang]
		});

		let sumsUrl = this.format(this.url('summonerSpells'), {
			version: this.VERSIONS.dd,
			lang: this.LANGS[this.lang]
		});


		// get the last versioning/realms
		fetch(this.format(this.url('realms'), {
			region: 'na'
		}))
		
		.then(res => res.json())
		.then(json => {
			// must update to the last patch or there is no cache
			if(json.dd != this.VERSIONS.dd || !this.cache.get('ddragon/summonerSpells.json')) {

				// load champions
				fetch(championsUrl)
					.then(res => res.json())
						.then(json => {
							this.champions = json.data;
							this.cache.create('ddragon/champions.json', this.champions);
						})
					.catch(error => console.log('Cannot get champions', error));

				// load items
				fetch(itemsUrl)
					.then(res => res.json())
						.then(json => {
							this.items = Object.filter(json.data, (id, item) => item.gold.purchasable && !item.hasOwnProperty('requiredAlly') && !item.hasOwnProperty('requiredChampion') && blackListItems.indexOf(parseInt(id)) === -1 && item.maps['11']);
							this.cache.create('ddragon/items.json', this.items);
						})
					.catch(error => console.log('Cannot get items.', error));

				// load summoner spells
				fetch(sumsUrl)
					.then(res => res.json())
						.then(json => {
							this.sumSpells = Object.filter(json.data, key => /Summoner((?!Mana|Snow|Poro).*)/.test(key));
							this.cache.create('ddragon/summonerSpells.json', this.sumSpells);
						})
					.catch(error => console.log('Cannot get summoner spells.', error));
			
			}
			
			
			// else just need to recover cached data
			else {
				this.champions = this.cache.get('ddragon/champions.json');
				this.items = this.cache.get('ddragon/items.json');
				this.sumSpells = this.cache.get('ddragon/summonerSpells.json');
			}

		});
	}
}


function checkStatus(res) {
    if(res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw console.log(res.statusText);
    }
}

Object.filter = function(obj, predicate) {
    let result = {};

    for(let key in obj) {
        if(obj.hasOwnProperty(key) && predicate(key, obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};

let blackListItems = [1400, 1401, 1402, 1412, 1413, 1414, 1416, 1419, 2052, 2054, 2421, 3007, 3008, 3029, 3073, 3671, 3672, 3673, 3675];