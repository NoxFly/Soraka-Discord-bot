const Discord = require('discord.js');
const main = require('./bot.js');
const DB = main.database;
const firebase = require('firebase');
const quests = require('./files/json/quests.json');
const items = require('./files/json/items.json');

const commands = [
    {
        name : 'spells',
        description : '',
        result : msg => {
            let embed = new Discord.RichEmbed()
                .setTitle('Wizard Spells')
                .setColor(0xF9B234)
                .addField(" • Profile & Quests : ", " • profile \n • inventory \n • quest \n • shop ")
                .addField(" • Spells : ", " • avada-kedavra \n • endoloris \n • sectumsempra \n • stupefix");
                
            msg.channel.send(embed);
        }
    },
    
    {
        name : 'profile',
        description : '',
        result : (msg, profile) => {
            let levelUp = Math.round(Math.pow(profile.game.level,2.3)*10);

            let embed = new Discord.RichEmbed()
                .setTitle(msg.author.username)
                .setColor(0xF9B234)
                .setThumbnail(profile.account.picture)
                .setDescription(" • Galleons : "+profile.game.galleons+"Ǥ"+
                "\n • Commun Room : "+profile.game.home.name+
                "\n • XP : "+Math.floor(profile.game.xp)+"/"+levelUp+
                "\n • Level : "+profile.game.level+
                "\n • Life : "+profile.game.hp+
                "\n • Quests completed : "+profile.game.quests_completed+
                "\n • Kills : "+profile.game.kill)
                .setFooter("Years at Hogwarts : " 
                + (Math.floor((Date.now()-profile.account.year)/(3.154*Math.pow(10,10)))+1), '');
            msg.channel.send(embed);
        }
    },

    {
        name: "shop",
        description: "",
        result: msg => {
            let txt = "";
            let j = 1;
            let emojis = [];

            for(i in items) {
                let end = ('.'.repeat(40-(items[i].price.length)))
                if(j%3==0 || i==items.length-1) end = '\n';
                j++;
                let emoji = "<:"+items[i].name+":"+items[i].id+">";
                emojis.push(items[i].id);
                txt += "<:"+items[i].name+":"+items[i].id+"> : "+items[i].price+"Ǥ "+end;
            }

            let embed = new Discord.RichEmbed()
                .setTitle("Wizard shop")
                .setColor(0xF9B234)
                .addField("What want you to buy, young sorcerer ?",txt);
            
            msg.channel.send(embed).then(message => {
                for(i in emojis) {
                    message.react(emojis[i]);
                }
            });
        }
    },

    {
        name: "inventory",
        result: (msg, profile) => {
            let inventory = profile.game.inventory;

            if(inventory=="") {
                inventory = "You have no object";
                msg.channel.send(inventory);
                return;
            } else {
                if(/ /gi) inventory = inventory.split(" ");
                else inventory = [inventory];
                
                let txt = "";
                let new_inventory = {};

                for(i in inventory) {
                    let item = inventory[i].replace(/_/gi, " ");

                    new_inventory[item] = typeof(new_inventory[item])=='undefined'? 1 : new_inventory[item] + 1;
                }

                for(i in new_inventory) {
                    let a = i;
                    if(new_inventory[i]>1) {
                        a += " `(x"+new_inventory[i]+")`";
                    }

                    txt += "• "+a+"\n";
                }

                let embed = new Discord.RichEmbed()
                    .setTitle("Inventory")
                    .setColor(0xF9B234)
                    .setThumbnail(profile.account.picture)
                    .setDescription(txt);
                
                msg.channel.send(embed);
            }
        }
    },

    {
        name: "quest",
        description: "",
        result: (msg, profile) => {
            if(profile.game.quests_completed==quests.length) {
                msg.channel.send("You already have completed all the quests !");
            } else {
                let quest = [];
                for(i in quests) {
                    if(quests[i].id == profile.game.quest) {
                        quest['name'] = quests[i].name;
                        quest['condition'] = quests[i].condition;
                        quest['xp'] = quests[i].reward.xp;
                        quest['galleons'] = quests[i].reward.galleons;
                    }
                }

                let embed = new Discord.RichEmbed()
                    .setTitle(quest['name'])
                    .setColor(0xF9B234)
                    .addField("Condition :",quest['condition'])
                    .addField("Reward :", " • xp : "+quest['xp']+"\n • galleons : "+quest['galleons']);
                msg.channel.send(embed);
            }
        }
    },

    {
        name: "eval",
        description: "",
        result: (msg, profile, args) => {
            if(msg.author.id=="316639200462241792") {
                try {msg.channel.send(eval(args));}
                catch(error) {msg.channel.send(error)}
            }
        }
    },

    {
        name: "daily",
        description: "",
        result: (msg, profile) => {
            if(Date.now()-profile.game.daily>=79200000) {
                profile.game.xp += 2;
                profile.game.galleons += 2;
                profile.game.daily = Date.now();
                DB.profile(msg.author.id).updateData('game', profile.game);
                msg.channel.send("**You obtain 2xp and 2 galleons ! Wait 22 hours before new daily**");
            } else {
                msg.channel.send("You must wait "+Math.floor((79200000-(Date.now()-profile.game.daily))/3600000)+" hours to claim your daily");
            }
        }
    },

    {
        name: "homes",
        description: "",
        result: msg => {
            let homes = [];
            DB.source('homes').getData('', (data) => {
                homes = data.val();
            });

            setTimeout(() => {
                let txt = "";
                
                let homes_names = [];
                for(i in homes) {
                    homes_names.push([i, homes[i]]);
                }

                homes_names.sort(function(a, b) {
                    return b[1] - a[1];
                });

                for(i in homes_names) {
                    txt += "\t• "+homes_names[i][0]+(".".repeat(10-homes_names[i][0].length))+" ("+homes_names[i][1]+" points)";
                    if(i==0) txt += " :crown:\n";
                    else txt += "\n";
                }

                let embed = new Discord.RichEmbed()
                    .setTitle("Homes Ranking")
                    .setColor(0xF9B234)
                    .setDescription(txt);
                msg.channel.send(embed);
            }, DB.responseTime);
        }
    },

    {
        name: "rank",
        description: "",
        result: (msg, profile) => {
            let home = profile.game.home.name;
            let profiles = [];
            DB.source('profiles').getData('', (data) => {
                profiles = data.val();
            });

            setTimeout(() => {
                let home_user = [];
                for(i in profiles) {
                    if(profiles[i].game.home.name==home) home_user.push({name: profiles[i].account.name, points: profiles[i].game.home_point});
                }

                home_user.sort(function(a, b) {
                    return b.points - a.points;
                });

                let txt = "```asciidoc\n= "+home+" Rank =\n";
                for(i in home_user) {
                    txt += home_user[i].name+(" ".repeat(40-home_user[i].name.length))+":: "+home_user[i].points+" pt.s";
                    if(i==0) txt += " 👑 \n";
                    else txt += "\n";
                }
                txt += "```";
                msg.channel.send(txt);

            }, DB.responseTime);
        }
    }
];

module.exports = commands;