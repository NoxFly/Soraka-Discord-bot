const Discord = require('discord.js');
let main = require('../bot.js');
let DB = main.database;
let firebase = require('firebase');
let quest_json = require('./json/quests.json');

const quest_completed = (user, profile) => {
    let quest = quest_json[profile.game.quest-1];
    
    let txt = "";
    if(quest.reward.xp>0)  txt += "\t• XP: "+quest.reward.xp;
    if(quest.reward.galleons>0 && quest.reward.xp>0) txt += "\n";
    if(quest.reward.galleons>0)  txt += "\t• Galleons: "+quest.reward.galleons;

    let embed = new Discord.RichEmbed()
        .setTitle("Quest completed !")
        .setColor(0xF9B234)
        .setThumbnail(profile.account.picture)
        .addField("Reward: ", txt)
        .setDescription("**name:** "+quest.name
            + "\n"+quest.condition);
    user.createDM().then(channel => {
        channel.send(embed);
    });

    profile.game.xp = profile.game.xp + quest.reward.xp;
    profile.game.galleons = profile.game.galleons + quest.reward.galleons;
    profile.game.quest++;
    profile.game.quests_completed++;
    profile.game.home_point += 2;
    DB.profile(user.id).updateData('game', profile.game);

    let home_point = 0;
    DB.source('homes').getData(profile.game.home.name, (data) => {
        home_point = data.val();
    });

    setTimeout(() => {
        DB.source('homes').updateData(profile.game.home.name, home_point+2);
    }, DB.responseTime);
};

module.exports = quest_completed;