const Discord = require('discord.js');
const main = require('./bot.js');
const DB = main.database;
const firebase = require('firebase');
const quests = require('./files/quests.js');
const oSpells = require('./files/json/spells.json');

/** 
 * SPELLS
 * FORMAT :
 * msg, profile, name, args, damge, % dodge
 */

const spells = [
    {
        name: "avada-kedavra",
        description: "",
        result: (msg, profile, args) => {
            call_spell(msg, profile, "avada-kedavra", args);
        }
    },

    {
        name: "sectumsempra",
        description: "",
        result: (msg, profile, args) => {
            call_spell(msg, profile, "sectumsempra", args);
        }
    },

    {
        name: "endoloris",
        description: "",
        result: (msg, profile, args) => {
            call_spell(msg, profile, "endoloris", args);
        }
    },

    {
        name: "stupefix",
        description: "",
        result: (msg, profile, args) => {
            call_spell(msg, profile, "stupefix", args);
        }
    }
];


/** 
 * FONCTION QUI GERE AUTOMATIQUEMENT LES SPELLS
 * @param object    msg objet discord
 * @param object    profile 
 * @param string    name_spell nom du sort
 * @param string    $target cible du sort
 * @param int       dmg dommages
 * @param int       escape % de chance d'esquiver le sort
 * @return void
 */
function call_spell(msg, profile, name_spell, ennemy) {
    let iSpell = 0;

    for(i in oSpells) {
        if(name_spell==oSpells[i].name) iSpell = i;
    }

    let dmg = oSpells[iSpell].dmg;
    let escape = oSpells[iSpell].escape;
    let cd = oSpells[iSpell].cooldown;
    let $target = ennemy || "undefined-target";
    
    let spells = profile.game.spells;
    if (!(/wand/.test(profile.game.inventory))) {
        msg.channel.send("You need a wand to cast a spell :joy:");
    } else if(spells=="") {
        msg.channel.send("You have not spells.\nTo obtain one, you must reach some levels");
    } else {
        let have_this_spell = false;
        (spells[name_spell]==undefined)? 1 : have_this_spell = true; 

        if(!have_this_spell) msg.channel.send('You have not learned this spell yet');
        
        else {
            if(Date.now()-spells[name_spell]<cd) {
                msg.channel.send("Cooldown: "+Math.ceil((cd-(Date.now()-spells[name_spell]))/3600000)+" minute(s)");
                return;
            }
            if($target=="undefined-target") {
                msg.channel.send("Hmmm... if you cast a spell, it's on a wizard...");
                return;
            }
            if(!(/<@!?\d+>/.test($target))) {
                msg.channel.send("Hmmm... if you cast a spell, it's on a wizard...");
                return;
            }

            let $id = $target.replace(/(\s+)?<@!?(\d+)>/, "$2");

            if($id == msg.author.id) {
                msg.channel.send("We don't accept suicidal in our community");
            } else {
                let $profile = [];
                
                DB.profile($id).getData('', function(data) {
                    $profile = data.val();
                });

                setTimeout(() => {
                    if($profile==undefined) {
                        msg.channel.send("This user are not yes in the Harry Potter world, so you can't attack him :pensive:");
                    } else if($profile.game.hp==0) {
                        msg.channel.send("Why want you to attack a dead player ?");
                    } else {
                        let dodge_random = Math.floor(Math.random()*100);
                        let $dodge = ($profile.game.dodge*dodge_random)/100;
                        if($dodge > 100-escape) {
                            msg.channel.send($profile.account.name+" has dodge your attack !");
                        } else {
                            if(dmg == "all") dmg = $profile.game.hp;
                            
                            let $hp = $profile.game.hp - dmg;
                            let txt = "You attacked "+$profile.account.name+" !";
                            if($hp<=0) {
                                $hp = 0;
                                txt = "You killed "+$profile.account.name+" !\nYou obtain 5xp and 1 galleon";
                                profile.game.xp += 5;
                                profile.game.galleons += 1;
                                profile.game.kill += 1;
                                profile.game.home_point += 1;
                                DB.profile(profile.account.id).updateData("game", profile.game);
                                
                                let home_point = 0;
                                DB.source('homes').getData(profile.game.home.name, (data) => {
                                    home_point = data.val();
                                });

                                setTimeout(() => {
                                    DB.source('homes').updateData(profile.game.home.name, home_point+1);
                                }, DB.responseTime);
                            }
                            DB.profile(profile.account.id).updateData('game/spells/'+name_spell, Date.now());
                            DB.profile($id).updateData('game/hp', $hp);
                            msg.channel.send(txt);
                        }
                    }
                }, DB.responseTime);
            }
        }
    }
}

module.exports = spells;