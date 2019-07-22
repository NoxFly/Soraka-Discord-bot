function send(msg, message) {
    msg.channel.send(message);
}


function fight(msg, idUser, profile) {
    Discord = require('discord.js');
    let champ = require('./../json/champions.json');
    let items = require('./../json/items.json');
    let main = require('./../bot.js');
    bot = main.bot;
    DB = main.database;
    App = main.app;
    id = idUser;
    played = false;
    let commande = msg.content.toLowerCase();

    let vowell = ['a', 'e', 'i', 'o', 'u'];
    let aN = 'a';
    if (App[id].round === undefined) App[id].round = 'true';

    if (App[id].adv === undefined) {
        App[id].adv = champ[Math.round(Math.random() * 140)];
        let aPlayers = ['adv', 'champion'];
        let aSpells = ['Q', 'W', 'E', 'R'];

        for (i in aPlayers) {
            for (j in aSpells) {
                if (aSpells[j] != 'R') App[id][aPlayers[i]].spells[aSpells[j]].currentCooldown = 0;
                else App[id][aPlayers[i]].spells[aSpells[j]].currentCooldown = 4;
            }
        }

        if (vowell.indexOf(App[id].adv.name[0].toLowerCase()) > -1) aN = 'an';

        let TMPname = App[id].adv.name.replace(/(\s+|\.)+/, '');
        let Ename = '';
        let index = TMPname.indexOf("'");
        for (j = 0; j < TMPname.length; j++) {
            if (j == index || TMPname[j] == ' ' || TMPname[j] == '.') {
                continue
            };
            if (j == index + 1 && index !== -1) Ename += TMPname[j].toLowerCase();
            else Ename += TMPname[j];
        }

        App[id].champion = getItemsProperties(App[id].champion, profile.game.items, items);

        let embed = new Discord.RichEmbed()
            .setAuthor('Fight !')
            .setColor(0xb88c40)
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/" + Ename + ".png")
            .setDescription('You are fighting against ' + aN + ' ' + App[id].adv.name + '\nYour champion is ' + App[id].champion.name + '\n**write `commands` and `rules`, you must know them to play**');
        send(msg, embed);
    }
    ennemy = App[id].adv;
    champion = App[id].champion;
    if (commande == ennemy.name.toLowerCase()) {
        let TMPname = ennemy.name.replace(/(\s+|\.)+/, '');
        let Ename = '';
        let index = TMPname.indexOf("'");
        for (j = 0; j < TMPname.length; j++) {
            if (j == index || TMPname[j] == ' ' || TMPname[j] == '.') {
                continue
            };
            if (j == index + 1 && index !== -1) Ename += TMPname[j].toLowerCase();
            else Ename += TMPname[j];
        }
        let embed = new Discord.RichEmbed()
            .setAuthor(ennemy.name)
            .setColor(0x942D18)
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/" + Ename + ".png")
            .addField('Health', ennemy.health, true)
            .addField('Attack', ennemy.attack, true)
            .addField('Armor', ennemy.armor, true)
            .addField('Critics', ennemy.critics, true);

        send(msg, embed);
    }

    if (commande == champion.name.toLowerCase()) {
        let embed = new Discord.RichEmbed()
            .setAuthor(champion.name)
            .setColor(0x1483CE)
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/" + champion.name + ".png")
            .addField('Health', champion.health, true)
            .addField('Attack', champion.attack, true)
            .addField('Armor', champion.armor, true)
            .addField('Critics', champion.critics + "%", true);
        send(msg, embed);
    }

    if (commande == "spells") {
        let table = [champion.spells.Q.damages, champion.spells.W.damages, champion.spells.E.damages, champion.spells.R.damages];
        for (i in table) {
            let txt = '';
            if (table[i] < 0) {
                switch (table[i]) {
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
            .setThumbnail("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/" + champion.name + ".png")
            .addField('Spell 1: `Q`', '\t• Damages: ' + table[0] + '\n\t• Cooldown: ' + champion.spells.Q.cooldown + ' round(s)', true)
            .addField('Spell 2: `W`', '\t• Damages: ' + table[1] + '\n\t• Cooldown: ' + champion.spells.W.cooldown + ' round(s)', true)
            .addField('Spell 3: `E`', '\t• Damages: ' + table[2] + '\n\t• Cooldown: ' + champion.spells.E.cooldown + ' round(s)', true)
            .addField('Spell 4: `R`', '\t• Damages: ' + table[3] + '\n\t• Cooldown: ' + champion.spells.R.cooldown + ' round(s)', true)
            .addField('Auto attack: `AA`', '\t• Damages: ' + champion.attack + '\n\t• Cooldown: 0 round(s)');

        send(msg, embed);
    }

    if (commande == 'commands') {
        let txt = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n**Commands**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n';
        txt += '• `ennemy name`: Get your current ennemy\'s data: health, attack, armor and critics\n';
        txt += '• `your champion name`: Get your current champion\'s data: health, attack, armor and critics\n';
        txt += '• `spells`: Show you the cooldown per round and the damages of your spells\n';
        txt += '• `attack {attack name}`: Attack your ennemy, or apply one of your spell. attack name: Q,W,E,R,AA\n';
        txt += '```Don\'t forget that you can change your champion thanks a!change {name of the champion} (outside of a fight)```'
        txt += '\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        send(msg, txt);
    }

    if (commande == 'rules') {
        let txt = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n**Rules**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n';
        txt += 'It\'s a turn-based fight.\nEach fight, you are against a random champion. If you win, you gain XP and gems :gem:, and more, you rally to your team the champion you won !\nIn the case of a defeat, you only lose gems :gem:.';
        txt += '\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        send(msg, txt);
    }

    /** */

    if (commande.startsWith("attack")) {
        if (App[id].round == 'wait') {
            send(msg, 'It\'s not your round !');
        } else if (App[id].round == 'true') {
            let attack = commande.replace(/attack(\s+)?/, '');
            if (!/\S+/.test(attack)) send(msg, 'Choose an attack !\n`commands` for all commands, and `spellinfo` to know your possible attacks');
            else {
                switch (attack) {
                    case 'q':
                    case 'w':
                    case 'e':
                    case 'r':
                        attackSpell(msg, attack, );
                        break;
                    case 'aa':
                        ennemy.health = Math.round(ennemy.health - autoAttack(msg));
                        App[id].adv.health = ennemy.health;
                        break;
                    default:
                        send(msg, 'possible attacks : `Q`, `W`, `E`, `R`, `AA`');
                }

                if (played) {
                    App[id].round = 'wait';
                    if (check(msg, 1) == 'alive') {
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
    let critic = (Math.random() * 100 > champion.critics) ? 0 : champion.attack;
    let dmg = champion.attack + critic;
    let armor = ennemy.armor;
    dmg = Math.round(dmg * (100 / (100 + armor)));
    send(msg, 'you auto attacked ' + ennemy.name + ' ! `-' + dmg + ' HP`');
    if (critic > 0) send(msg, "**`Critical strike !`**")
    played = true;
    return dmg;
}

function ennemyAttack(msg) {
    let choiceDelay;
    let spell;
    let spells = [
        ['his Q', ennemy.spells.Q.currentCooldown, ennemy.spells.Q.damages, 'Q'],
        ['his W', ennemy.spells.W.currentCooldown, ennemy.spells.W.damages, 'W'],
        ['his E', ennemy.spells.E.currentCooldown, ennemy.spells.E.damages, 'E'],
        ['his R', ennemy.spells.R.currentCooldown, ennemy.spells.R.damages, 'R'],
        ['an auto attack', '0', ennemy.attack]
    ];

    do {
        spell = Math.round(Math.random() * 4);
        choiceDelay = spells[spell][1];
    } while (choiceDelay > 0);

    if (spells[spell][2] > 0) {
        let typeArmor = champion.armor;
        if (ennemy.type == "AP" && spells[spell][0] != 'an auto attack') typeArmor = champion.magic;
        let dmg = 0;
        if (spells[spell][0] == "an auto attack") dmg = spells[spell][2] + ((Math.random() * 100 > ennemy.critics) ? 0 : spells[spell][2]);
        dmg = Math.round(spells[spell][2] * (100 / (100 + typeArmor)));
        send(msg, 'The ennemy do ' + spells[spell][0] + ' `-' + dmg + ' hp`');
        champion.health = Math.round(champion.health - dmg);
        App[id].champion.health = champion.health;
    } else {
        switch (spells[spell][2]) {
            case -1:
                break;
            case -2:
                break;
            case -3:
                ennemy.health += 60;
                App[id].adv.health = ennemy.health;
                send(msg, "The ennemy heal himslef `+60 hp`");
                break;
        }
    }

    App[id].round = 'true';

    if (/^this/.test(spells[spell][0])) {
        ennemy.spells[spells[spell][3]].currentCooldown = ennemy.spells[spells[spell][3]].cooldown;
    }

    if (champion.health > 0) send(msg, '*It\'s your turn*');
}

function attackSpell(msg, attack) {
    attack = attack.toUpperCase();
    attack = attack.replace(/\s+/, '');
    let spellDelay = champion.spells[attack].currentCooldown;
    if (spellDelay > 0) {
        send(msg, 'You cannot use this spell.\nYou must wait ' + spellDelay + ' round');
        played = false;
    } else {
        champion.spells[attack].currentCooldown = champion.spells[attack].cooldown;

        if (champion.spells[attack].damages > 0) {
            let typeArmor = ennemy.armor;
            if (champion.type == "AP") typeArmor = ennemy.magic;
            let dmg = Math.round(champion.spells[attack].damages * (100 / (100 + typeArmor)));
            send(msg, 'You attacked the ennemy with your ' + attack + ' ! `-' + dmg + ' hp`');
            ennemy.health -= dmg;
            App[id].adv.health = ennemy.health;
        } else {
            switch (champion.spells[attack].damages) {
                case -1:
                    break;
                case -2:
                    break;
                case -3:
                    champion.health += 60;
                    App[id].champion.health = champion.health;
                    send(msg, "You heal yourself `+60 hp`");
                    break;
            }
        }

        App[id].round = 'wait';
        played = true;
    }
}

function check(msg, player) {
    if (player) {
        if (App[id].adv.health <= 0) {
            App[id].adv.health = 0;
            ennemy.health = 0;

            let embed = new Discord.RichEmbed()
                .setThumbnail('http://www.legendsbr.com/wp-content/uploads/2014/10/victory.png')
                .setDescription('You won 50 gems :gem:, 100 XP and you have rallied a new champion: ' + ennemy.name + '.\n\nDo `a!select ' + ennemy.name + '` to play with this champion')
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
                user.game.championList[user.game.championList.length] = ennemy.name;
                DB.updateData('', user);
                App[id] = undefined;
            }, DB.responseTime);
            return;
        }
        return 'alive';
    } else {
        if (App[id].champion.health <= 0) {
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
                if (money < 0) money = 0;
                DB.profile(id).updateData('data/money', money);
                DB.profile(id).updateData('game/defeat', defeat);
                App[id] = undefined;
            }, DB.responseTime);
        }
    }
}

function cooldown() {
    let aPlayers = ['adv', 'champion'];
    let aSpells = ['Q', 'W', 'E', 'R'];

    for (i in aPlayers) {
        for (j in aSpells) {
            if (App[id][aPlayers[i]].spells[aSpells[j]].currentCooldown > 0) App[id][aPlayers[i]].spells[aSpells[j]].currentCooldown -= 1;
        }
    }
}

function getItemsProperties(champion, champItems, items) {
    for (i in champItems) {
        if (champItems[i] == "test") continue;
        for (j in items) {
            if (items[j].name == champItems[i]) {
                for (k in items[j]["stats"]) {
                    if (["AP"].indexOf(k) === -1) {
                        champion[k] += items[j].stats[k];
                        if (champion[k] > 80 && k == "critics") champion[k] = 80;
                        if (champion[k] > 40 && k == "cooldown") champion[k] = 40;
                    } else {
                        if (k == "AP" && champion.type == "AP") {
                            for (l in champion.spells) {
                                if (champion.spells[l].damages > 0) champion.spells[l].damages += items[j].stats[k];
                            }
                        }
                    }
                }
            }
        }
    }

    for (i in champion.spells) {
        champion.spells[i].cooldown -= Math.round(champion.cooldown * champion.spells[i].cooldown / 100);
        if (champion.spells[i].cooldown < 1) champion.spells[i].cooldown = 1;
    }
    return champion;
}

module.exports = fight;