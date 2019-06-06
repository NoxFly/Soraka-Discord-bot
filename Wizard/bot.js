// CONSTANTS LIBS + DB INI
const Discord = require('discord.js');
const bot = new Discord.Client();
const firebase = require('firebase');
const DB = require('./files/DB.js');

// LET IMPORTANTES
let exportObj = module.exports = {};
let Database = new DB();
exportObj.database = Database;
exportObj.bot = bot;

// CONSTANTS FILES 
let commands = require('./command.js');
const spells = require('./spells.js'); 
const check = require('./files/check.js');
const fct_choose_home = require('./files/survey.js');
const quests = require('./files/quests.js');
const quest_completed = require('./files/quest_completed.js');
const reaction_command = require('./files/reaction_command.js');

// CONSTANTS VAR
const id_guild = "456451653034442783";
const tag = "wiz-";
const token = "NDU3MTkyODY0NjQ1MTIwMDAw.DrHjig._mfKP48hq0TQsN4ItFIsCj3O8UA";

// on fusionne les deux fichiers pour avoir un seul fichier de commandes lors de l'execution
commands = commands.concat(spells);

// on récupère tout les noms de commandes une seule fois, ca nous évite à chaque msg de devoir recalculer
let aCommands = [];
for(i=0; i<commands.length; i++) {
    aCommands.push(commands[i].name);
}

/** ******************************************************************* **/
/** ******************************************************************* **/

// quand un user écrit un msg
bot.on('message', (msg) => {
    member = msg.author;
    if(member.bot) {
        return;
    }
    try {
        check(member.id, member.username+"#"+member.discriminator, member.avatarURL, member);
        
        Database.setAuthor(msg.author);
        Database.profile(msg.author.id);
        let home_user = "none";

        let profile_data = [];

        Database.getData('', (data) => {
            profile_data = data.val();
        });
        setTimeout(() => {
            if(msg.channel.type!=="dm") {
                // on actualise toutes les infos en ligne
                // si l'utilisateur n'est pas dans une maison / ou si le bot est reset
                if(profile_data.game.home===undefined || profile_data.game.home.name!=="none") {
                    try {
                        role = msg.guild.roles.find('name', profile_data.game.home.name);
                        home_id = role.id;
                        Database.profile(member.id).updateData('game/home/id', home_id);
                        member.addRole(role);
                    } catch(error) {

                    }
                }
                
                if(profile_data.account.banned==0 && profile_data.account.active==1) {
                    if(quests(msg, profile_data, 1)) quest_completed(member, profile_data);
                    get_message(msg, profile_data);
                    Database.profile(member.id).updateData('game/xp', profile_data.game.xp+0.1);
                }
            }
        }, Database.responseTime+300);
    } catch(error) {
        console.log("erreur .onMessage");
        console.log(error);
    }
});

/** ******************************************************************* **/
/** ******************************************************************* **/
/* si un user réagit */

bot.on('messageReactionAdd', (reaction, user) => {
    try {
        if(user.id!="457192864645120000") {
            check(user.id, user.username+"#"+user.discriminator, user.avatarURL, user);
            Database.setAuthor(user);
            Database.profile(user.id);
            
            let profile_data = [];

            Database.getData('', (data) => {
                profile_data = data.val();
            });
            setTimeout(function() {
                if(reaction.message.author.id=="457192864645120000") {
                    if(quests(reaction, profile_data, 0)) quest_completed(user, profile_data);
                    if(profile_data.account.banned==0 && profile_data.account.active==1) {
                        if(profile_data.game.home == "none") {
                            fct_choose_home(reaction, user, profile_data);
                        } else {
                            reaction_command(reaction, user, profile_data);
                        }
                    }
                }
            }, DB.responseTime);
        }
    } catch(error) {
        console.log("Reaction error:");
        console.log(error);
    }
});

/** ******************************************************************* **/
/** ******************************************************************* **/
/* quand le bot est lancé */

bot.on('ready',() => {
    bot.user.setActivity('wiz-spells','https://twitch.tv/Wizard');
    bot.user.setStatus('online');

    let embed = new Discord.RichEmbed()
        .setTitle(' the Magic begins !') 
        .setColor(0xF9B234)
        .addField(" • status : online ", " \"  `wiz-spells` \"  for list of spells   <:hedwig:459380510951735297>");
    console.log("I'm ready");
       //bot.guilds.find('id',id_guild).channels.find('name','diagon_alley').send(embed);
});
 
/** ******************************************************************* **/
/** ******************************************************************* **/
/* quand un new user rejoind le server */

bot.on("guildMemberAdd", member => {
    let role = member.guild.roles.find('name', 'Muggle');
    member.addRole(role);

    let embed = new Discord.RichEmbed()
        .setTitle('A Muggle !') 
        .setColor(0xF9B234)
        .addField(` • ` + member.user.username + " Welcome to The Marauders");
        
    bot.guilds.find('id', id_guild).channels.find('name','diagon_alley').send(embed);
    check(member.id, member.user.username+"#"+member.user.discriminator, member.user.avatarURL, member, true);
});


/** ******************************************************************* **/
/** ******************************************************************* **/
/* functions */

function get_message(msg, profile) {
    if(msg.content.indexOf(tag) === 0) {
        let command = msg.content.split(tag)[1].split(' ')[0];
        if(aCommands.indexOf(command) > -1) {
            let args = msg.content.replace("wiz-"+command, "").replace(" ","");
            command = commands[aCommands.indexOf(command)];
            try {command.result(msg, profile, args)}
            catch (error) {console.log(error);}
        } else {
            msg.channel.send("Spell does not exist, little wizard. Read all books, to know all existing spells !");
        }
    }
}

// sert à connecter le bot
bot.login(token);
