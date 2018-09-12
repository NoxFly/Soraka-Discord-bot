// External functions
let admin = require('./admin.js');
let dump = require('./dump.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}


function fight(msg, idUser, name) {
    Discord = require('discord.js');
    let champ = require('./../functions/champions.json');
    let main = require('./../bot.js');
    bot = main.bot;
    DB = main.database;
    App = main.app;
    id = idUser;
    played = false;
    let commande = msg.content.toLowerCase();

    /** */
    
    let vowell = ['a','e','i','o'];
    let aN = 'a';
    if(App[id].round===undefined) App[id].round = 'true';

    if(App[id].adv===undefined) {
        App[id].adv = champ[Math.round(Math.random()*140)];
        let aPlayers = ['adv','champion'];
        let aSpells = ['Q','W','E','R'];
        
        for(i in aPlayers) {
            for(j in aSpells) {
                if(aSpells[j]!='R') App[id][aPlayers[i]].spells[aSpells[j]].Currentdelay = 0;
                else App[id][aPlayers[i]].spells[aSpells[j]].Currentdelay = 4;
            }
        }

        if(vowell.indexOf(App[id].adv.name[0].toLowerCase())>-1) aN = 'an';

        let TMPname = App[id].adv.name.replace(/(\s+|\.)+/,'');
        let Ename = '';
        let index = TMPname.indexOf("'");
        for(j=0; j<TMPname.length; j++) {
            if(j==index || TMPname[j]==' ' || TMPname[j]=='.') {continue};
            if(j==index+1 && index!==-1) Ename+=TMPname[j].toLowerCase();
            else Ename+=TMPname[j];
        }
        let embed = new Discord.RichEmbed()
            .setAuthor('Fight !')
            .setColor(0xb88c40)
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+Ename+".png")
            .setDescription('You are fighting against '+aN+' '+App[id].adv.name+'\nYour champion is '+App[id].champion.name+'\n**write `commands` and `rules`, you must know them to play**');
        send(msg, embed);
    }
    console.log(App[id].champion.spells);

    ennemy = App[id].adv;
    champion = App[id].champion;
    if(commande=='ennemy') {
        let TMPname = ennemy.name.replace(/(\s+|\.)+/,'');
        let Ename = '';
        let index = TMPname.indexOf("'");
        for(j=0; j<TMPname.length; j++) {
            if(j==index || TMPname[j]==' ' || TMPname[j]=='.') {continue};
            if(j==index+1 && index!==-1) Ename+=TMPname[j].toLowerCase();
            else Ename+=TMPname[j];
        }
        let embed = new Discord.RichEmbed()
            .setAuthor(ennemy.name)
            .setColor(0x942D18)
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+Ename+".png")
            .addField('Health', ennemy.health, true)
            .addField('Attack', ennemy.attack, true)
            .addField('Armor', ennemy.armor, true)
            .addField('Critics', ennemy.critics, true);

        send(msg, embed);
    }

    if(commande==champion.name.toLowerCase()) {
        let embed = new Discord.RichEmbed()
            .setAuthor(champion.name)
            .setColor(0x1483CE)
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+champion.name+".png")
            .addField('Health', champion.health, true)
            .addField('Attack', champion.attack, true)
            .addField('Armor', champion.armor, true)
            .addField('Critics', champion.critics, true);
        send(msg, embed);
    }

    if(/spellinfo/i.test(msg.content)) {
        let table = [champion.spells.Q.damages,champion.spells.W.damages,champion.spells.E.damages,champion.spells.R.damages];
        for(i in table) {
            let txt = '';
            if(table[i]<0) {
                switch(table[i]) {
                    case -1:
                        txt = 'Dodge'
                        break;
                    case -2:
                        txt = 'resistance'
                        break;
                    case -3:
                        txt = 'heal'
                        break;
                }
                table[i] = txt;
            }
        }

        let embed = new Discord.RichEmbed()
            .setAuthor(champion.name)
            .setColor(0x1483CE)
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+champion.name+".png")
            .addField('Spell 1: `Q`', '\t• Damages: '+table[0]+'\n\t• Cooldown: '+champion.spells.Q.delay+' round(s)', true)
            .addField('Spell 2: `W`', '\t• Damages: '+table[1]+'\n\t• Cooldown: '+champion.spells.W.delay+' round(s)', true)
            .addField('Spell 3: `E`', '\t• Damages: '+table[2]+'\n\t• Cooldown: '+champion.spells.E.delay+' round(s)', true)
            .addField('Spell 4: `R`', '\t• Damages: '+table[3]+'\n\t• Cooldown: '+champion.spells.R.delay+' round(s)', true)
            .addField('Auto attack: `AA`', '\t• Damages: '+champion.attak+'\n\t• Cooldown: 0 round(s)');

        send(msg, embed);
    }

    if(commande=='commands') {
        let txt = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n**Commands**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n';
        txt += '• `ennemy`: Get your current ennemy\'s data: health, attack, armor and critics\n';
        txt += '• `the name of your champ`: Get your current champion\'s data: health, attack, armor and critics\n';
        txt += '• `spellinfo`: Show you the cooldown per round and the damages of your spells\n';
        txt += '• `attack : {attack name}`: Attack your ennemy, or apply one of your spell. attack name: Q,W,E,R,AA\n';
        txt += '```Don\'t forget that you can change your champion thanks b!change {name of the champion} (outside of a fight)```'
        txt += '\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        send(msg, txt);
    }

    if(commande=='rules') {
        let txt = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n**Rules**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n';
        txt += 'It\'s a turn-based fight.\nEach fight, you are against a random champion. If you win, you gain XP and gems :gem:, and more, you rally to your team the champion you won !\nIn the case of a defeat, you only lose gems :gem:.';
        txt += '\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        send(msg, txt);
    }

    /** */

    if(/attack/.test(commande)) {
        if(App[id].round=='wait') {
            send(msg, 'It\'s not your round !');
        } else if(App[id].round=='true'){
            let attack = commande.replace(/attack(\s+)?/,'');
            if(!/\S+/.test(attack)) send(msg, 'Choose an attack !\n`commands` for all commands, and `spellinfo` to know your possible attacks');
            else {
                switch(attack) {
                    case 'q':
                    case 'w':
                    case 'e':
                    case 'r':
                        attackSpell(msg, attack,);
                        break;
                    case 'aa':
                        ennemy.health = Math.round(ennemy.health-autoAttack(msg));
                        App[id].adv.health = ennemy.health;
                        break;
                    default:
                        send(msg, 'possible attacks : `Q`, `W`, `E`, `R`, `AA`');
                }

                if(played) {
                    App[id].round = 'wait';
                    if(check(msg, 1)=='alive') {
                        ennemyAttack(msg);
                        check(msg, 0);
                        cooldown();
                    }
                }
            }
        } else {
            send(msg, 'Something went wrong...');
        }
    }
}

function autoAttack(msg) {
    let dmg = champion.attack;
    let armor = ennemy.armor;
    dmg = Math.round(dmg-(armor*dmg)/100);
    send(msg, 'you auto attacked '+ennemy.name+' ! `-'+dmg+' HP`');
    played = true;
    return dmg;
}

function ennemyAttack(msg) {
        let choiceDelay;
        let spell;
        let spells = [
            [
                'his Q', ennemy.spells.Q.Currentdelay, ennemy.spells.Q.damages, 'Q'
            ],
            [
                'his W', ennemy.spells.W.Currentdelay, ennemy.spells.W.damages, 'W'
            ],
            [
                'his E', ennemy.spells.E.Currentdelay, ennemy.spells.E.damages, 'E'
            ],
            [
                'his R', ennemy.spells.R.Currentdelay, ennemy.spells.R.damages, 'R'
            ],
            [
                'an auto attack', '0', ennemy.attack
            ]
        ];

        do {
            spell = Math.round(Math.random()*4);
            choiceDelay = spells[spell][1];
        } while(choiceDelay>0);

        if(spells[spell][2]>0) {
            let dmg = Math.round(spells[spell][2]-(champion.armor*spells[spell][2])/100);
            send(msg, 'The ennemy do '+spells[spell][0]+' `-'+dmg+' hp`');
            champion.health = Math.round(champion.health-dmg);
            App[id].champion.health = champion.health;
        }
        
        App[id].round = 'true';
        
        if(/^this/.test(spells[spell][0])) {
            ennemy.spells[spells[spell][3]].Currentdelay = ennemy.spells[spells[spell][3]].delay;
        }

        if(champion.health>0) send(msg, '*It\'s your turn*');
}

function attackSpell(msg, attack) {
    attack = attack.toUpperCase();
    attack = attack.replace(/\s+/,'');
    let spellDelay = champion.spells[attack].Currentdelay;
    if(spellDelay>0) {
        send(msg, 'You cannot use this spell.\nYou must wait '+spellDelay+' round');
        played = false;
    } else {
        champion.spells[attack].Currentdelay = champion.spells[attack].delay;
        
        if(champion.spells[attack].damages>0) {
            let dmg = Math.round(champion.spells[attack].damages-(ennemy.armor*champion.spells[attack].damages)/100);
            send(msg, 'You attacked the ennemy with your '+attack+' ! `-'+dmg+' hp`');
            ennemy.health -= dmg;
            App[id].adv.health = ennemy.health;
        }
        App[id].round = 'wait';
        played = true;
    }
}

function check(msg, player) {
    if(player) {
        if(App[id].adv.health<=0) {
            App[id].adv.health = 0;
            ennemy.health = 0;
            
            let embed = new Discord.RichEmbed()
                .setThumbnail('http://www.legendsbr.com/wp-content/uploads/2014/10/victory.png')
                .setDescription('You won 50 gems :gem:, 100 XP and you have rallied a new champion: '+ennemy.name+'.\n\nDo `b!select '+ennemy.name+'` to play with this champion')
                .setColor(0x1483CE);
            send(msg, embed);
            DB.profile(id).updateData('game/fighting', 0);
            let user;
            DB.profile(id).getData('', function(data) {
                user = data.val();
            });

            setTimeout(function() {
                user.data.money += 50;
                user.data.xp += 100;
                user.game.owned++;
                user.game.wins++;
                user.game.championsList[Object.keys(user.game.championsList).length] = ennemy.name;
                DB.updateData('', user);
                App[id] = undefined;
            },DB.responseTime);
            return;
        }
        return 'alive';
    } else {
        if(App[id].champion.health<=0) {
            App[id].champion.health = 0;
            champion.health = 0;
            let embed = new Discord.RichEmbed()
                .setThumbnail('http://www.legendsbr.com/wp-content/uploads/2014/10/defeat.png')
                .setDescription('You lose 50 gems :gem:')
                .setColor(0x942D18);
            send(msg, embed);
            DB.profile(id).updateData('game/fighting', 0);
            let money;
            DB.profile(id).getData('data/money', function(data) {
                money = data.val();
            });
            let defeat;
            DB.profile(id).getData('game/defeat', function(data) {
                defeat = data.val();
            });

            setTimeout(function() {
                defeat++;
                money -= 50;
                if(money<0) money = 0;
                DB.profile(id).updateData('data/money', money);
                DB.profile(id).updateData('game/defeat', defeat);
                App[id] = undefined;
            },DB.responseTime);
        }
    }
}

function cooldown() {
    let aPlayers = ['adv','champion'];
    let aSpells = ['Q','W','E','R'];
    
    for(i in aPlayers) {
        for(j in aSpells) {
            if(App[id][aPlayers[i]].spells[aSpells[j]].Currentdelay>0) App[id][aPlayers[i]].spells[aSpells[j]].Currentdelay -= 1;
        }
    }
    console.log(App[id].champion.spells);
}

module.exports = fight;