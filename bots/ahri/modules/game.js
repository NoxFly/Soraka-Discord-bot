let firebase = require('firebase');
let main = require('./../../../bot.js');
let bot = main.bot;
let DB = main.database;
const champ = require('./../../../json/champions.json');
const items = require('./../../../json/items.json');
const Discord = require('discord.js');
let App = main.app;

// External functions
const admin = require('./../../../functions/admin.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}


let game = [
    {
		name: 'loveme',
		description: 'say yes or no.',
		usage: 'a!loveme',
		group: 'game',
		result: (msg) => {
			if(!(msg.content=="a!loveme")) send(msg, 'Juste write `a!loveme ...`');
			let love = ['yes :heart:','no :broken_heart:'];
			send(msg, 'My answer is '+love[Math.round(Math.random())]);
		}
	},

	{
		name: 'dice',
		description: 'roll a 6-sides dice.',
		usage: 'a!dice a number from 1 to 6',
		group: 'game',
		result: (msg) => {
			if(/^(dice \d+)$/.test(msg.content.split('a!')[1])) {
				let n = msg.content.split('dice ')[1];
				
				if(n<1 || n>6 || n != Math.round(n)) {
					send(msg, 'The number must be an integer between 1 and 6');
				}
				if(!(/\d+/.test(n))) {
					send(msg, 'Must be a number !');
				}
				
				let r = Math.round(Math.random()*5+1);
				let res = (r==n)?'**You win**':'**You lose**';
				send(msg, ':game_die: Your number: '+n+'\nDice result : '+r+'\n'+res);
			} else {
				send(msg, 'You must choose a number');
			}
		}
    },
    
    {
		name: 'champ',
		description: 'Show image of a League of Legends champion',
		usage: 'a!champ {name} {skin digit}',
		group: 'game',
		result: (msg, args) => {
			if(msg.content=='a!champ') {
				let r = Math.round(Math.random()*champ.length);
				let embed = new Discord.RichEmbed()
					.setTitle(champ[r].name)
					.setDescription("https://euw.leagueoflegends.com/en/game-info/champions/"+champ[r].name)
					.setImage("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+champ[r].name+".png");
					send(msg, embed);
			} else if(args.length==3 || args.length==4 && args[2]=="skin") {
				let champion, skin, __champion__, __champ__;
				if(args.length==3) {
					champion = args[0].toLowerCase().replace(/'/,"");
					skin = args[2];
				} else {
					champion = (args[0]+args[1]).toLowerCase().replace(/'/,"");
					skin = args[3];
				}
				
				for(i in champ) {
					__champion__ = champ[i].name;
					__champ__ = __champion__.toLowerCase().replace(/(\s+|\.|\')+/,'');
					if(champion==__champ__) {
						let name = '';
						let index = __champion__.indexOf("'");
						for(j=0; j<__champion__.length; j++) {
							if(j==index || __champion__[j]==' ' || __champion__[j]=='.') {continue};
							if(j==index+1 && index!==-1) name+=__champion__[j].toLowerCase();
							else name+=__champion__[j];
						}
						let embed = new Discord.RichEmbed()
							.setTitle(__champion__)
							.setImage("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+name+"_"+skin+".jpg");
						send(msg, embed);
						return;
					}
				}
				send(msg, 'This champion does not exist :x:');
			} else if(args.length==1 || args.length==2) {
				let champion = args.length==1? args[0] : args[0]+args[1];
				champion = champion.toLowerCase().replace(/'|\s+|\./, "");
				let __champion__, __champ__;
				for(i in champ) {
					let __champion__ = champ[i].name;
					let __champ__ = __champion__.toLowerCase().replace(/(\s+|\.|')+/,'');
					if(champion==__champ__) {
						let name = '';
						let index = __champion__.indexOf("'");
						for(j=0; j<__champion__.length; j++) {
							if(j==index || __champion__[j]==' ' || __champion__[j]=='.') {continue};
							if(j==index+1 && index!==-1) name+=__champion__[j].toLowerCase();
							else name+=__champion__[j];
						}
						
						let embed = new Discord.RichEmbed()
							.setTitle(__champion__)
							.setDescription("https://euw.leagueoflegends.com/en/game-info/champions/"+name)
							.setImage("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+name+".png");
						send(msg, embed);
						return;
					}
				}
			send(msg, 'This champion does not exist :x:');
        	}
      	}
    },
    
    {
		name: 'toss',
		description: 'heads or tails ?\n \tYou win double your bet or you lose your bet',
		usage: 'a!toss {head/tails} {integer}',
		group: 'game',
		result: (msg, args, profile) => {
			if(args.length!=2 || !/heads|tails/.test(args[0]) || !/^[0-9]+$/.test(args[1])) {
				send(msg, 'You need to chose `heads` or `tails` and an integer');
				return;
			}
			
			let money = profile.data.money,
				n = args[0],
				somme = args[1],
				p,r,s;

			if(money>0 && somme>money) {
				send(msg, 'You can\'t bet greater than gem you have. :scales:');
			} else {
				if(money==0) {
					send(msg, 'Sorry, you can play this game only if you have gems.\n To obtain gems, write a!daily each 12 hours !');
				} else {
					r = (Math.round(Math.random()))? 'heads':'tails';
					(n==r)? p = 'win ' : p = 'lose ';
				
					if(p=='win ') {
						somme *= 2;
						s = ' :gem:';
					} else {
						somme = -somme;
						s = '';
					}

					money += somme;
					if(money < 0) money = 0;
				
					DB.setData('data/money', money);
				
					msg.channel.send('The piece turn on itself').then(message => {
						setTimeout(function() {
							message.edit('The piece turn on itself.');
						}, 500);
						setTimeout(function() {
							message.edit('The piece turn on itself..');
						}, 1000);
						setTimeout(function() {
							message.edit('The piece turn on itself...');
						}, 1500);
						setTimeout(function() {
							message.edit('the piece turns on itself...\n'+r+' ! You '+p+Math.abs(somme)+s+'\nYour gems : ' + money);
						},2000);
					});
				}
			}
		}
	},

	{
		name: 'joke',
		description: 'let me tell you a joke...',
		usage: 'a!joke',
		group: 'game',
		result: (msg) => {
			let refj = firebase.database().ref('jokes');
			 
			let jokes = [];
			refj.on('child_added',function (data) {
				jokes.push(data.val());
  	 		});
		
			setTimeout(function(){
				let r = Math.round(Math.random()*(jokes.length-1));
				let joke = jokes[r];

				let embed = new Discord.RichEmbed()
					.setTitle('Joke')
					.setColor(0xFFE0B2)
					.setDescription(joke);
			
				send(msg, embed);
			},1000);
		}

	},

	{
		name: 'quote',
		description: 'let me tell you a quotation...',
		usage: 'a!quote',
		group: 'game',
		result: (msg) => {
			let lang, quotes = [];

			DB.getData('choices', function(data) {
				data = data.val();
				lang = data.lang;
			});
		
			setTimeout(function(){
				if(lang===null) lang = 'EN';
			 	let l2 = Math.round(Math.random()*4)+1;
			 	
			 	let refq = firebase.database().ref('quotes/'+lang+'/'+l2);
			 	refq.on('child_added',function(data) {
					quotes.push(data.val());
  	 			});
			 	
			 	setTimeout(function() {
					let quote = quotes[1];
					let embed = new Discord.RichEmbed()
						.setTitle('['+lang+'] by '+quotes[0])
						.setColor(0xFFE0B2)
						.setDescription(quote);

					send(msg, embed);
				},1000);
			},DB.responseTime);
		}
	},

	{
		name: 'rps',
		description: 'Play Rock Paper Scissors with me :scissors: lose or win 10 :gem:',
		usage: 'a!rps {weapon}',
		group: 'hidden',
		result: (msg) => {
			let weapon = msg.content.split('rps ')[1];
			if(weapon===undefined) send(msg, 'Choose a weapon !');

			let weapons = ["rock","paper","scissors"];

			if(weapons.indexOf(weapon)==-1) send(msg, '**Rock**, **paper** or **scissors** !');

			weapon = weapon.toLowerCase();
			let iUser;

			if(weapon=='rock') iUser = 0;
			else if(weapon=='paper') iUser = 1;
			else iUser = 2;

			let icons = {
				rock: ':mountain:',
				paper: ':leaves:',
				scissors: ':scissors:'
			}

			let iAhri = Math.round(Math.random()*2);
			let ennemy = weapons[iAhri];
			let result;

			if(iUser<iAhri && ((iUser!=0 && iAhri!=2) || (iUser!=2 && iAhri!=0))) result = 'lose';
			else {
				if(iUser==0 && iAhri==2) result = 'won';
				else if(iUser==2 && iAhri==0) result = 'lose';
				else if(iUser==iAhri) result = 'draw';
				else result = 'won';
			}

			let txt = 'You chose '+weapon+' '+icons[weapon]+'\nI chose '+ennemy;

			if(result=='won') {
				txt += '\nYou '+result+' 10 :gem:';
			} else if(result=='lose') {
				txt += '\nYou '+result+' 10 :gem:';
			}

			send(msg, txt);

			let money;

				DB.getData('data/money', function(data) {
					money = data.val();
					console.log(money);
				});

				setTimeout(function() {
					if(result=='won') {
						money += 10;
					} else if(result=='lose') {
						money -= 10;
					}

					DB.updateData('data/money', money);
				},DB.responseTime);
		}
	},

	{
		name: 'fight',
		description: 'fight a random champion, and win xp and gems. You only lose gems',
		usage: 'a!fight',
		group: 'game',
		result: (msg, args, profile) => {
			if(msg.content!=='a!fight') send(msg, "Dont't need any argument");
			if(profile.game.owned==0) send(msg, 'You didn\'t choose your first champion !\nDo `a!choose`');
			else {
				let champion = profile.game.champion;
				let fighting = profile.game.fighting;
				if(fighting==0) {
					send(msg, ':crossed_swords: fight mode activated\nThis fight is in MP with me');
					send(msg, 'Champion selected: '+champion);
					DB.updateData('game/fighting', 1);
					msg.author.send('You don\'t need to write the tag while you are fighting (only for the fight)\n**Write anything to start**');
				} else {
					send(msg, 'You already are on fight mode');
				}
			}
		}
	},

	{
		name: 'stopfight',
		description: 'stop fight',
		usage: 'a!fight',
		group: 'game',
		result: (msg, args, profile) => {
			if(msg.content!=='a!stopfight') send(msg, "Dont't need any argument");
			if(!admin(msg.author.id)) return;

			if(profile.game.owned===0) send(msg, 'You didn\'t choose your first champion !\nDo `a!choose`');
			else {
				let fighting = profile.game.fighting;

				if(fighting==1) {
					send(msg, ':crossed_swords: You stopped fight');
					App[msg.author.id] = undefined;
					DB.updateData('game/fighting', 0);
				} else {
					send(msg, 'You already don\'t are on fight mode');
				}
			}
		}
	},

	{
		name: 'choose',
		description: 'Chose your first champion !',
		usage: 'a!choose {champion}',
		group: 'game',
		result: (msg, args, profile) => {
			if(profile.game.owned==0) {
				let champions = ['ashe','garen','ryze'];

				if(args.length!=1) send(msg, 'Choose between 3 champion :\n• **Ashe**\n• **Garen**\n• **Ryze**\n`a!champ {champion name}` to see image of a champion');
				else {
					let choice = args[0].toLowerCase();
					if(champions.indexOf(choice)==-1) send(msg, 'You only can choose between **Ashe**, **Garen** and **Ryze**');
					else {
						let stats;
						for(i in champ) {
							let ch = champ[i].name;
							ch = ch.toLowerCase();
							if(choice==ch) {
								stats = champ[i];
							}
						}
						
						stats.cooldown = 0;

						choice = choice[0].toUpperCase()+choice.substring(1);
						send(msg, 'You chose '+choice);
						profile.game.owned = 1;
						profile.game.champion = choice;
						profile.game.params = stats;
						profile.game.championList = {0: choice};
						profile.param.BG = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'+choice+'_0.jpg';
						DB.updateData('', profile);
					}
				}
			} else {
				send(msg, 'You already choose your first champion :stuck_out_tongue:');
			}
		}
	},

	{
		name: 'select',
		description: 'select your ingame champion',
		group: 'game',
		usage: 'a!select {champion}',
    	result: (msg, args, profile) => {
			if(!args[0]) {
				send(msg, 'Choose a champion');
				return;
			}

			if(profile.game.owned==0) send(msg, 'You didn\'t choose your first champion !\nDo `a!choose`');
			else if(profile.game.fighting) send(msg, 'You are on fight');
			else {
				champion = args.join(" ").toLowerCase();
				let possible = [];
				let j = 0;
				for(i=0; i<profile.game.championList.length; i++) {
					possible.push(profile.game.championList[i].toLowerCase());
				}
				
				if(possible.indexOf(champion)!==-1) {
					for(i=0; i<champ.length; i++) {
						if(champ[i].name.toLowerCase()==champion) j = i;
					}
					
					let embed = new Discord.RichEmbed()
						.setAuthor('New selection :')
						.setColor(0x1483CE)
						.setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+champ[j].name.replace(" ","")+".png")
						.setDescription('You chose '+champ[j].name);
					send(msg, embed);
					console.log(champ[j])
					profile.game.champion = champ[j].name;
					profile.game.params = champ[j];
					profile.game.params.cooldown = 0;
					profile.param.BG = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'+champ[j].name.replace(" ","")+'_0.jpg';

					DB.updateData('', profile);
				} else send(msg, 'You don\'t have this champion');
			}
        }
	},

	{
		name: 'shop',
		description: 'use shop to buy items to grow up your champion\'s skill',
		group: 'game',
		usage: 'a!shop [info](optionnal) {item}',
		result: (msg, args, profile) => {
			if(profile.game.owned==0) {
				send(msg, "You must write `a!choose` to initiate your profile's game");
			} else if(args.length>0 && args[0]!="info") {
				if(profile.game.items.length==7) {
					send(msg, "You already have 6 items. Sell one to save place");
					return;
				}
				// achete un item
				args[1] = args.join(" ").toLowerCase().replace(/(\s+)|(info)|'/g, "");
				let reg = new RegExp(args[1]);
				let txtTip = "Item not found. Maybe one of this :\n```\n";
				for(i in items) {
					let itemName = items[i].name.toLowerCase().replace(/\s+|'/, "");
					if(itemName!=args[1] && reg.test(itemName)) {
						txtTip += items[i].name+"\n";
						item = true;
					} else if(itemName==args[1]) {
						let money = profile.data.money;
						if(money>=items[i].price) {
							for(j in profile.game.items) {
								if(profile.game.items[j]==items[i].name) {
									send(msg, "You already have this item");
									return;
								}
							}
							let embed = new Discord.RichEmbed()
								.setTitle("You bought **"+items[i].name+"**")
								.setColor(0xf9b234)
								.setDescription(items[i].plaintext)
								.setThumbnail(items[i].icon)
								.addField("Sold:", "-"+items[i].price+" :gem:");
							send(msg, embed);
							profile.data.money -= items[i].price;
							profile.game.items[Object.keys(profile.game.items).length] = items[i].name;
							DB.updateData("", profile);
						}
						else send(msg, "You don't have enought money");
						return;
					}
				}
				txtTip += "```";
				send(msg, txtTip);
			} else if(args.length>=2 && args[0]=="info") {
				// infos sur un item
				args[1] = args.join(" ").toLowerCase().replace(/(\s+)|(info)|'/g, "");
				let reg = new RegExp(args[1]);
				let item = null;
				for(i in items) {
					let itemName = items[i].name.toLowerCase().replace(/\s+|'/, "");
					if(itemName==args[1] || reg.test(itemName)) {
						let embed = new Discord.RichEmbed()
							.setTitle(items[i].name)
							.setColor(0xf9b234)
							.setDescription(items[i].plaintext)
							.setThumbnail(items[i].icon)
							.addField("Price", items[i].price+" :gem:");
						send(msg, embed);
						item = true;
					}
				}
				
				if(!item) send(msg, "item not found");
			} else if(args.length==0) {
				// affiche un tableau de tous les items (juste le nom)
				let itemNames = "```\n";
				for(i in items) itemNames += items[i].name+(" ".repeat(25-items[i].name.length))+((i%3==0 && i!=0)?"\n":"");
				itemNames += "\n\nTotal items: "+(++i)+"```";
				send(msg, itemNames);
			}
		}
	},

	{
		name: "sell",
		description: "sell item(s) you equiped to fight",
		usage: "a!sell item",
		group: "game",
		result: (msg, args, profile) => {
			if(profile.game.owned==0) {
				send(msg, "You must write `a!choose` to initiate your profile's game");
			} else if(args.length==0) {
				send(msg, "You must write which item you want to sell");
			} else {
				let itemList = [];
				for(i in profile.game.items) {
					itemList.push(profile.game.items[i].toLowerCase());
				}
				let itemToSell = args.join(" ").toLowerCase();
				let idx =itemList.indexOf(itemToSell);
				if(idx===-1) {
					send(msg, "item not found");
				} else {
					send(msg, "item sold");
					profile.game.items.splice(idx, 1);
					DB.updateData("game/items", profile.game.items);
				}
			}
		}
	},

	{
		name: "items",
		description: "Show items you equiped to fight",
		usage: "a!items",
		group: "game",
		result: (msg, args, profile) => {
			if(profile.game.owned==0) {
				send(msg, "You must write `a!choose` to initiate your profile's game");
				return;
			} else if(args.length==0) {
				let itemList = "";
				for(i in profile.game.items) {
					if(i>0) itemList += "- "+profile.game.items[i]+"\n";
				}

				let embed = new Discord.RichEmbed()
					.setTitle("Your items:")
					.setColor(0xf9b234)
					.setDescription(itemList);
				send(msg, embed);
			}
		}
	}
];

module.exports = game;