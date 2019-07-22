let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');
let dump = require('./dump.js');

function send(msg, message) {
	msg.channel.send(message);
}

function log(msg, log) {
	let embed = new Discord.RichEmbed()
		.setAuthor('Log')
		.setColor(0xE82C0C)
		.setDescription(log);
	send(msg, embed);
}

/** **/

const profile = function(msg, arg2) {
    console.log(typeof arg2)
    let profile = [], timeExe = 0;
    if(typeof arg2 == 'object') {
        profile = arg2;
    } else {
        DB.profile(arg2).getData('choices', function(d) {
            profile.choices = d.val();
        });

        DB.profile(arg2).getData('data', function(d) {
            profile.data = d.val();
        });

        DB.profile(arg2).getData('followers', function(d) {
            d = d.val();
            profile.followers = (Object.keys(d).length);
        });

        DB.profile(arg2).getData('param', function(d) {
            profile.param = d.val();
        });

        timeExe = DB.responseTime;
    }

    try {        
        setTimeout(function() {
            profile.data.level = 1;
            if(profile.param.Avatar=="") profile.param.Avatar = 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349';
            while(Math.pow(profile.data.level,2.3)*10<profile.data.xp) {
                profile.data.level++;
            }

            DB.profile(msg.author.id).updateData('data/level', profile.data.level);

            let lowN = Math.round(Math.pow(profile.data.level-1,2.3)*10),
                upN = Math.round(Math.pow(profile.data.level,2.3)*10),
                mXP = upN-lowN,
                aXP = profile.data.xp-lowN,
                perc = Math.round((aXP*100)/mXP);
            let embed;

            embed = new Discord.RichEmbed()
                .setTitle('🔸️ User info')
                .setColor(profile.choices.color)
                .setThumbnail(profile.param.Avatar)
                .addField(profile.param.username, msg.author.id)
                .addField("Level :", profile.data.level, true)
                .addField("Money :", profile.data.money, true)
                .addField("XP :", profile.data.xp+'/'+upN+' ('+perc+'% to reach next level)')
                .addField("Followers :", (Object.keys(profile.followers).length), true)
                .addField("Reputation: ", profile.data.rep, true)
                .setFooter(profile.param.desc, 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349');

            send(msg, embed);
        }, timeExe);
    } catch(error) {
        send(msg, 'Sorry, an error occurred, I was unable to view the profile');
    }
};

module.exports = profile;