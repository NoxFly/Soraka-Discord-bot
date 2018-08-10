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

const profile = function(msg, id, name, avatar) {
        if(avatar=="no" || avatar===null) avatar = 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349';
        try {
            let choices = {},
                data = {},
                delay = {},
                followers = {},
                desc;

            DB.profile(id).getData('choices', function(d) {
                choices = d.val();
            });

            DB.profile(id).getData('data', function(d) {
                data = d.val();
            });

            DB.profile(id).getData('delay', function(d) {
                delay = d.val();
            });

            DB.profile(id).getData('followers', function(d) {
                d = d.val();
                followers = (Object.keys(d).length)-1;
            });

            DB.profile(id).getData('param/desc', function(d) {
                desc = d.val();
            });
            
            setTimeout(function() {
                while(Math.pow(data.level,2.3)*10<data.xp) {
                    data.level++;
                }

                DB.profile(id).updateData('data/level', data.level);

                let lowN = Math.round(Math.pow(data.level-1,2.3)*10),
                    upN = Math.round(Math.pow(data.level,2.3)*10),
                    mXP = upN-lowN,
                    aXP = data.xp-lowN,
                    perc = Math.round((aXP*100)/mXP);
                let embed;

                embed = new Discord.RichEmbed()
                    .setTitle(':small_orange_diamond: User info')
                    .setColor(choices.color)
                    .setThumbnail(avatar)
                    .addField(name, id)
                    .addField("Level :", data.level, true)
                    .addField("Money :", data.money, true)
                    .addField("XP :", data.xp+'/'+upN+' ('+perc+'% to reach next level)')
                    .addField("Followers :", followers, true)
                    .addField("Reputation: ", data.rep, true)
                    .setFooter(desc, 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349');

                send(msg, embed);
            },DB.responseTime);
        } catch(error) {
            send(msg, 'Sorry, an error occurred, I was unable to view the profile');
        }
};

module.exports = profile;