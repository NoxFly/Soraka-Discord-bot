const firebase = require('firebase');
const main = require('./../bot.js');
const questions = require('./json/questions_survey.json');
const bot = main.bot;
const Discord = require('discord.js');
const DB = main.database;

// ⚀⚁⚂⚃
let n_code = ["\u0034\u20E3","\u0031\u20E3","\u0032\u20E3","\u0033\u20E3"];
let n_identifier = ["1%E2%83%A3","2%E2%83%A3","3%E2%83%A3","4%E2%83%A3"];
let n = [1,2,3,4];
let volontaires = [
    "316639200462241792", "456475577755369474", "396421738067394560", 
    "327571360970965003", "314475641883852801", "207218344187789315"];

const survey = function(reaction, user, profile) {

    progress = profile.game.survey;
    switch(progress) {
        case questions[0].name:
            get_answer(reaction, user, profile, 0);
            break;
        case questions[1].name:
            get_answer(reaction, user, profile, 1);
            break;
        case questions[2].name:
            get_answer(reaction, user, profile, 2);
            break;
    }
}

function get_answer(reaction, user, profile, i) {
    if(reaction.message.content!="**Question "+(i+1)+":**\n*"+questions[i].question+"*") return;

    let index = n_identifier.indexOf(reaction.emoji.identifier)
    if(index>-1) {
        console.log("Choix: "+n[index]+"\nCorrespond à: "+questions[i].answer["r"+n[index]]);
        DB.profile(user.id).updateData('game/answers/a'+(i+1), questions[i].answer["r"+n[index]]);
    }

    if(i<2) {
        user.createDM().then(channel => {
            channel.send("**Question "+(i+2)+":**\n*"+questions[i+1].question+"*").then(message => {
                message.react("\u0031\u20E3");
                message.react("\u0032\u20E3");
                message.react("\u0033\u20E3");
                message.react("\u0034\u20E3");
            });
        });
        DB.profile(user.id).updateData('game/survey', "q"+(i+2));
    } else {
        user.createDM().then(channel => {
            channel.send("Thanks for your answer !\nHmmmm. You are placed on ...");
            let choices = [];
            DB.profile(user.id).getData('game/answers', (data) => {
                choices = data.val();
            });

            setTimeout(() => {
                let rsp = [
                    {
                        nb: 0,
                        name: "Slytherin"
                    },
                    {
                        nb: 0,
                        name: "Gryffindor"
                    },
                    {
                        nb: 0,
                        name: "Hufflepuff"
                    },
                    {
                        nb: 0,
                        name: "Ravenclaw"
                    }
                ];

                for(i in choices) {
                    for(j in rsp) {
                        if(rsp[j].name==choices[i]) rsp[j].nb++;
                    }
                }

                let home = "";
                if (!delete rsp["undefined"]) {  }
                rsp.sort((a,b) => {return b.nb-a.nb});
                console.log(rsp);
                home = rsp[0].name;
                console.log("home: "+home);
                channel.send(home+" home !");

                DB.profile(user.id).updateData('game/home', {id:"", name: home});
                DB.profile(user.id).deleteData('game/answers');
                DB.profile(user.id).deleteData('game/survey');

                let embed = new Discord.RichEmbed()
                    .setTitle('Le choixpeau magique a décidé !')
                    .setColor(0xF9B234)
                    .setThumbnail(user.avatarURL)
                    .addField('Maison: ', home)
                    .addField('User: ', profile.account.name);

                for(i in volontaires) {
                    try {
                        bot.users.get(volontaires[i]).createDM().then(channel => {
                            channel.send(embed);
                        });
                    } catch(error) {
                        console.log(error);
                        console.log("Could not send to one vol. : "+volontaires[i]);
                    }
                }
            }, DB.responseTime);
        });
    }
}

module.exports = survey;