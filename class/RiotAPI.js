const fetch = require('node-fetch');
const fs = require('file-system');
const cacheSystem = require('./Cache.js');
const md5 = require('md5');

let dataPath;

module.exports = class RiotAPI {
	/**
	 * Create Riot API class manager
	 * @param {string} configPath Riot config file path
	 * @param {string} dPath data path
	 */
	constructor(configPath, dPath) {
		dataPath = dPath;

		this.apiKey = require(`${configPath}/config.js`).riot.apiKey;
		this.consts = require(`${configPath}/riotConsts.json`);

		// default lang & region
		this.lang = 'us';
		this.region = 'EUW';

		// champions, items and spells lists
		this.champions = this.items = this.sumSpells = this.runes = {};

		// prestige level steps
		this.levels = [1, 30, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500];
		// rank divisions
		this.divisions = {I: '1', II: '2', III: '3', IV: '4'};
		// lanes
		this.lanes = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'];

		// players data cache
		this.cache = new cacheSystem(dPath + '/cache');

		// load json objects
		this.loadPrerequires();
	}

	// SHORTCUCTS
	get URLS() 		{return this.consts.URLS;}
	get REGIONS() 	{return this.consts.REGIONS;}
	get LANGS() 	{return this.consts.LANGS;}
	get VERSIONS() 	{return this.consts.VERSIONS;}

	/**
	 * Replace matches {match} by given values
	 * @param {string} url url to format
	 * @param {object} obj object of matches
	 * @return {string} formatted url
	 */
	format(url, obj) {
		let matches = url.match(/\{[a-zA-Z]+\}/g);
		if(!matches) return url;
		for(let m of matches) {
			if(m.replace(/(\{|\})+/g, '') in obj) url = url.replace(m, obj[m.replace(/(\{|\})+/g, '')]);
		}
		return url;
	}

	/**
	 * Returns the url of a given key - search on every objects on the CONSTS
	 * @param {string} key json constants key
	 * @return {string}
	 */
	url(key) {
		for(let domain of Object.keys(this.URLS)) {
			if(key in this.URLS[domain].url) return this.URLS[domain].base + this.URLS[domain].url[key];
		}
	}


	// champions & items & spells
	
	/**
	 * Search champion's object thanks his name
	 * @param {string} name champion's name
	 * @return {object}
	 */
	champion(name) {
		return this.format(this.URLS.base, {});
	}

	/**
	 * Returns the splash's URL of a champion
	 * @param {string} champion champion's key
	 * @param {number} n splash's number (default is classic one)
	 * @return {string}
	 */
	getSplash(champion, n=0) {
		return this.format(this.url('championSplash'), {
			champion: champion,
			n: n
		});
	}

	/**
	 * Returns the champion's square splash URL
	 * @param {number} id champion's id
	 * @return {string}
	 */
	championSquare(id) {
		return this.format(this.url('championSquare'), {
			champion: id,
			version: this.VERSIONS.dd
		});
	}

	/**
	 * Returns the summoner spell's square splash URL
	 * @param {string} spell spell's name
	 * @return {string}
	 */
	spellImage(spell) {
		return this.format(this.url('summonerSpell'), {
			version: this.VERSIONS.dd,
			spell: spell
		});
	}

	spellName(spellId) {
		return Object.keys(this.sumSpells).find(spell => this.sumSpells[spell].key == spellId);
	}

	/**
	 * Returns champion's object thanks his id
	 * @param {number} id champion's id
	 * @return {object}
	 */
	getChampionById(id) {
		let obj = Object.filter(this.champions, (i, champion) => champion.key == id);
		if(Object.keys(obj).length == 1) return obj[Object.keys(obj)[0]];
		return undefined;
	}

	/**
	 * Returns champion's rotation depending on the region
	 * @param {string} region LoL's region
	 */
	async getRotation(region=this.region) {
		let lastRefresh = this.cache.get('rotation/rotation');
		if(!lastRefresh) lastRefresh = 0;
		else lastRefresh = lastRefresh.lastRefresh;

		let d = new Date();
		let now = Date.now();

		let img = `${dataPath}/cache/rotation/champion-rotation.png`;
		if(!fs.existsSync(img) || (d.getDay() == 2 && d.getHours() >= 2 && now-lastRefresh > 90000000)) {
			// not cached or need to refresh
			let rotation = await fetch(this.format(this.url('championRotation'), {
				region: this.REGIONS[region],
				version: this.VERSIONS.rotation
			})+this.api_key).then(data => data.json()).catch(error => console.log(error));

			this.cache.create('rotation/rotation', {lastRefresh: now});

			return rotation;
		}

		// get the cache
		return img;
	}

	gameType(gameQueueConfigId) {
		return this.queues[Object.keys(this.queues).find(q => this.queues[q].queueId == gameQueueConfigId)]?.description.replace(' games', '');
	}

	/**
	 * Get items that cannot be upgraded
	 */
	get maxItems() {
		return Object.filter(this.items, (id, item) => (!item.hasOwnProperty('into') && item.tags.indexOf('Consumable') === -1 && item.tags.indexOf('Trinket') === -1 && (item.gold.total > 1000 || item.tags.indexOf('Boots')!==-1)) || (id != '3801' && 'into' in item && !(this.items.hasOwnProperty(item.into[0]))));
	}

	/**
	 * Get Riot API key string (end of URL request)
	 */
	get api_key() {
		return '?api_key='+this.apiKey;
	}


	// summoner

	/**
	 * Recover summoner's data - creates a cache
	 * @param {string} name summoner's name
	 * @param {string} region summoner's region
	 * @param {boolean} image either we just want to recover the stored image about his profile or entire object data
	 * @return {string|object}
	 */
	async summoner(name, region, onlyCore=false) {
		// get basic summoner data
		let summoner = await fetch(this.format(this.url('summonerByName'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.summoner,
			name: name
		}) + this.api_key)
		.then(res => res.json())
		.then(summoner => ({
			id: summoner.id,
			name: summoner.name,
			profileIconId: summoner.profileIconId,
			level: summoner.summonerLevel,
			accountId: summoner.accountId
		}))
		.catch(console.error);

		// can't find the summoner
		if(!summoner?.id) return null;
		
		summoner.region = region;

		if(onlyCore) {
			return summoner;
		}

		// cached data
		let data = this.cache.get(`players/${region}/${md5(summoner.id)}`);
		let matches = (await this.summonerMatchList(summoner.accountId, region)).matches.splice(0, 3);
		let modified = false;

		if(!data || matches[0].gameId != data.games[0].gameId) {
			data = JSON.parse(JSON.stringify(summoner));

			// not cache file : create one
			const rank = (await this.summonerRank(summoner.id, region)).filter(league => /SOLO/.test(league.queueType));
			data.league = rank[0]?? null;

			const mastery = await this.summonerMastery(summoner.id, region);
			data.mastery = mastery.splice(0, 3);

			data.masteryScore = await this.summonerMasteryScore(summoner.id, region);

			for(let i in matches) {
				matches[i] = await this.summonerMatch(matches[i].gameId, region);
			}

			data.games = matches;

			modified = true;
		}
		
		else {
			// watch if he played. If yes, then we need to refresh all data.
			// if he didn't played, it means nothing changed (mastery, xp/level)
		}

		// refresh the cache file if some data has been modified
		if(modified) {
			this.cache.create(`players/${region}/${md5(summoner.id)}`, data);
		}

		return data;
	}

	/**
	 * Recover summoner's rank data - creates cache
	 * @param {number} id summoner's id
	 * @param {string} region summoner's region
	 * @return {object}
	 */
	async summonerRank(id, region) {
		return await fetch(this.format(this.url('league'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.league,
			encryptedSummonerId: id
		}) + this.api_key)
		.then(league => league.json())
		.catch(console.error);
	}

	/**
	 * Recover summoner's mastery data - creates cache
	 * @param {number} id summoner's id
	 * @param {string} region summoner's region
	 * @return {object}
	 */
	async summonerMastery(id, region) {
		return await fetch(this.format(this.url('championMasteries'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.mastery,
			encryptedSummonerId: id
		}) + this.api_key)
		.then(mastery => mastery.json())
		.catch(console.error);
	}

	/**
	 * Recover summoner's mastery score - creates cache
	 * @param {number} id summoner's id
	 * @param {string} region summoner's region
	 * @return {object}
	 */
	async summonerMasteryScore(id, region) {
		return await fetch(this.format(this.url('championMasteryScore'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.mastery,
			encryptedSummonerId: id
		}) + this.api_key)
		.then(mastery => mastery.json())
		.catch(error => console.log(error));
	}

	/**
	 * Recover summoner's match list - creates cache
	 * @param {number} id summoner's id
	 * @param {string} region summoner's region
	 * @return {object}
	 */
	async summonerMatchList(id, region) {
		return await fetch(this.format(this.url('summonerMatchlist'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.match,
			encryptedAccountId: id
		}) + this.api_key)
		.then(matchlist => matchlist.json())
		.catch(console.error);
	}

	/**
	 * Recover details about a given match
	 * @param {number} matchId match's id
	 * @param {string} region match's region
	 * @return {object}
	 */
	async summonerMatch(matchId, region) {
		return await fetch(this.format(this.url('match'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.match,
			matchId: matchId
		})+this.api_key)
		.then(match => match.json())
		.catch(console.error);
	}

	/**
	 * Recover participant's id from summoner's id in a match
	 * @param {number} match match's id
	 * @param {number} summonerId summoner's id
	 * @return {object}
	 */
	findParticipantId(match, summonerId) {
		const part = match.participantIdentities;
		let i = 0;

		while(part[i].player.summonerId != summonerId && i < 9) {
			i++;
		}

		return part[i].participantId;
	}

	/**
	 * Recover participant's data from a match thanks his participant's id
	 * @param {number} match match's id
	 * @param {number} participantId participant's id
	 * @return {object}
	 */
	findParticipantData(match, participantId) {
		let i = 0;

		while(match.participants[i].participantId != participantId && i < 9) {
			i++;
		}

		return match.participants[i];
	}


	async spectateGame(summonerName, region) {
		const summoner = await this.summoner(summonerName, region, true);

		if(!summoner) {
			return null;
		}

		const match = await fetch(this.format(this.url('spectator'), {
			region: this.REGIONS[region],
			version: this.VERSIONS.spectator,
			encryptedSummonerId: summoner.id
		}) + this.api_key)
		.then(res => res.json())
		.catch(console.error);

		// console.log(match);

		if(match.status === 404) {
			return match;
		}

		return {summoner, match};

	}

	
	/**
	 * Returns fundamental runes's object
	 * @param {string} rune perk name or perk key
	 * @return {object}
	 */
	getRune(rune) {
		return this.runes.find(perk => perk.id === rune || perk.name === rune);
	}

	/**
	 * Returns fundamental runes's object
	 * @return {array<object>}
	 */
	getFundamentalRunes() {
		return this.runes.map(perk => ({
			id: perk.id,
			key: perk.key,
			icon: perk.icon,
			name: perk.name	
		}));
	}

	/**
	 * Returns runes's object
	 * @param {string} rune perk name or perk key
	 * @return {array<object>}
	 */
	getSlotsRunes(rune) {
		return this.getRune(rune).slots;
	}

	getSlotsRuneDetail(rune, slot) {
		return this.getSlotsRunes(rune).find(_slot => _slot.key === slot || _slot.name === slot);
	}

	perkIcon(perk) {
		return this.format(this.url('perkIcon'), {
			perk: perk
		});
	}


	/**
	 * Loads pre-requires before any other execution
	 */
	loadPrerequires(forceUpdate=false) {
		// get the last versioning/realms
		fetch(this.format(this.url('realms'), {
			region: 'na'
		}))
		
		.then(res => res.json())
		.then(json => {
			this.patchVersion = json.v;


			// must update to the last patch or there is no cache
			if(json.dd != this.VERSIONS.dd || !this.cache.get('ddragon/champions') || forceUpdate) {

				this.VERSIONS.dd = json.dd;

				const championsUrl = this.format(this.url('champions'), {
					version: this.VERSIONS.dd,
					lang: this.LANGS[this.lang]
				});
		
				const itemsUrl = this.format(this.url('items'), {
					version: this.VERSIONS.dd,
					lang: this.LANGS[this.lang]
				});
		
				const sumsUrl = this.format(this.url('summonerSpells'), {
					version: this.VERSIONS.dd,
					lang: this.LANGS[this.lang]
				});
		
				const runesUrl = this.format(this.url('perks'), {
					version: this.VERSIONS.dd,
					lang: this.LANGS[this.lang]
				});

				const queuesUrl = this.url('queues');

				// load champions
				fetch(championsUrl)
					.then(res => res.json())
					.then(json => {
						this.champions = json.data;
						this.cache.create('ddragon/champions', this.champions);
					})
					.catch(error => console.error('Cannot get champions', error));

				// load items
				fetch(itemsUrl)
					.then(res => res.json())
					.then(json => {
						this.items = Object.filter(json.data, (id, item) => item.gold.purchasable && !item.hasOwnProperty('requiredAlly') && !item.hasOwnProperty('requiredChampion') && blackListItems.indexOf(parseInt(id)) === -1 && item.maps['11']);
						this.cache.create('ddragon/items', this.items);
					})
					.catch(error => console.error('Cannot get items.', error));

				// load summoner spells
				fetch(sumsUrl)
					.then(res => res.json())
					.then(json => {
						this.sumSpells = Object.filter(json.data, key => /Summoner((?!Mana|Snow|Poro).*)/.test(key));
						this.cache.create('ddragon/summonerSpells', this.sumSpells);
					})
					.catch(error => console.error('Cannot get summoner spells.', error));

				// load runes
				fetch(runesUrl)
					.then(res => res.json())
					.then(json => {
						this.runes = json;
						this.cache.create('ddragon/runes', this.runes);
					})
					.catch(error => console.error('Cannot get cdragon runes.', error));


				// const queues type
				fetch(queuesUrl)
					.then(res => res.json())
					.then(json => {
						this.queues = json;
						this.cache.create('ddragon/queues', this.queues);
					})
					.catch(error => console.error('Cannot get queues constants', error));
			
			}
			
			
			// else just need to recover cached data
			else {
				this.champions = this.cache.get('ddragon/champions');
				this.items = this.cache.get('ddragon/items');
				this.sumSpells = this.cache.get('ddragon/summonerSpells');
				this.runes = this.cache.get('ddragon/runes');
				this.queues = this.cache.get('ddragon/queues');
			}

		});
	}
}

/**
 * Checks the status of a fetch
 * @param {object} res result of a fetch
 */
function checkStatus(res) {
    if(res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw console.log(res.statusText);
    }
}

/**
 * Filter an object. Similare to Array.filter()
 * @param {object} obj object to filter
 * @param {function} predicate function which filters the object
 */
Object.filter = function(obj, predicate) {
    let result = {};

    for(let key in obj) {
        if(obj.hasOwnProperty(key) && predicate(key, obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};

// items to black list
let blackListItems = [1400, 1401, 1402, 1412, 1413, 1414, 1416, 1419, 2052, 2054, 2421, 3007, 3008, 3029, 3073, 3671, 3672, 3673, 3675];