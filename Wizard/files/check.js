const firebase = require('firebase');
const main = require('./../bot.js');
const bot = main.bot;
const Discord = require('discord.js');
const DB = main.database;
const questions = require('./json/questions_survey.json');

const check = function(id, name, avatar, member, _new) {
    avatar = avatar || '';
    let profile = [];
    DB.profile(id).getData('', function(data) {
        profile = data.val();
    });

    setTimeout(function() {
        if(profile==undefined) {
            let randomCode = Math.round(Math.random() * 10000000) + "_" + id;
            let defaut = {
                site: {
                    access: randomCode,
                },

                account: {
                    name: name,
                    picture: avatar,
                    year: Date.now(),
                    id: id,
                    active: 1,
                    banned: 0,
                    about: "nothing"
                },
                
                game: {
                    galleons: 20,
                    inventory: '',
                    home: 'none',
                    quest: 1,
                    quests_completed: 0,
                    hp: 100,
                    xp: 0,
                    level: 1,
                    spells: "",
                    dodge: 2,
                    survey: "q1",
                    answers: {
                        a1: "none",
                        a2: "none",
                        a3: "none",
                    },
                    home_point: 0,
                    kill: 0,
                    daily: 0
                }
            };
            
            try {              
                DB.source('profiles').addData('', id, defaut);

                if(_new) member = member.user;
                member.createDM().then(channel => {
                    let embed = new Discord.RichEmbed()
                        .setTitle('Welcome to The Marauders') 
                        .setColor(0xF9B234)
                        .addField(' • begins in the Magic World : ', " to have a better experience and access all the features, login on https://the-marauders.com : \n\n ") 
                        .addField(' step 1 :', "    click on \" LOGIN \", and paste this ID : ` " + randomCode + " ` ") 
                        .addField(' step 2 :', "    ready ! you can buy items, see your stats /ratios , and setting your profile") 
                        .setFooter("We wish you a wonderful experience, The Marauders ", "https://cdn.discordapp.com/emojis/460106637026525184.png?v=1");
                
                    channel.send(embed);
                    setTimeout(() => {
                        channel.send(":warning: When you enter the server, your profile photo, your nickname and your discord ID are automatically stored in our database, for non-commercial purposes; if you do not"
                        +" agree, look at #information\nIf your account was reset, please DM ドリアン#8850, thanks");
                        setTimeout(() => {
                            channel.send("```SURVEY !```If you want to be on one of the fourth home, you must answer to 3 little questions.");
                            channel.send("\n**Question 1:**\n*"+questions[0].question+"*").then(message => {
                                message.react("\u0031\u20E3");
                                message.react("\u0032\u20E3");
                                message.react("\u0033\u20E3");
                                message.react("\u0034\u20E3");
                            });
                        }, 400);
                    }, 400);
                });
                console.log('compte créé ! --> '+name);
            } catch(error) {
                console.log('euh... ya eu une erreur');
                console.log(error);
            }
        } else {
            try {
                DB.profile(id).updateData('account/picture', avatar);
                let xp = profile.game.xp;
                level = 1;

                while(Math.pow(level,2.3)*10<xp) {
                    level++;
                }

                if(level>50) level = 50;

                DB.profile(id).updateData('game/level', level);
            } catch(error) {
                console.log(error);
            }
        }
    },DB.responseTime);
};

module.exports = check;