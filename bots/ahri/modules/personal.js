let firebase = require('firebase');
let main = require('../../../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');
const fs = require('fs');
let App = main.app;

// External functions
const admin = require('../../../functions/admin.js');
const checkPerms = require('../../../functions/checkPerms.js');
const getTop = require('../../../functions/gettop.js');
const mtsm = require('../../../functions/mtsm.js');
const dump = require('../../../functions/dump.js');
const getProfile = require('../../../functions/profile.js');

// *** //

function send(msg, message) {
    msg.channel.send(message);
}

let personal = [{
        name: 'lang',
        description: 'set your personnal language for the quotes.',
        usage: 'a!lang EN/FR/IT/DE/ES/RU/JP/CH',
        group: 'personal',
        result: (msg, args) => {
            let languages = ['EN', 'FR', 'IT', 'DE', 'ES', 'PT', 'RU', 'JP', 'CH'],
                lang = '',
                txt = '';
            if (args.length == 1) {
                lang = args[0].toUpperCase();

                if (languages.indexOf(lang) < 0) {
                    txt = '';
                    for (let i = 0; i < languages.length; i++) {
                        txt += '`' + languages[i] + '`,';
                    }
                    send(msg, 'Languages available : ' + txt);
                } else {
                    send(msg, 'Your language has been saved (' + lang + ') :tongue:');
                    DB.setData('choices/lang', lang);
                }
            }
        }
    },

    {
        name: 'note',
        description: 'save something you want to restore another moment. Maximum notes : 10.',
        usage: 'a!note your note',
        group: 'personal',
        result: (msg, args, profile) => {
            let note = args.join(" "),
                i, c, notes;
            if (args.length == 0) {
                send(msg, 'A note cannot be empty');
                return;
            }

            notes = profile.notes;
            i = Object.keys(notes).length;
            c = 'note' + i;
            msg.channel.send('wait please...').then(message => {
                if (i == 11) message.edit('Maximum number of notes reached !');
                else {
                    DB.newNote(c, note);
                    message.edit('Your note has been saved :inbox_tray::pencil:');
                }
            });
        }
    },

    {
        name: 'mynotes',
        description: 'show your personnals note.',
        usage: 'a!mynote',
        group: 'personal',
        result: (msg, args, profile) => {
            if (msg.content != "a!mynotes") return;
            let notes = profile.notes,
                txt = '',
                i, n;

            txt = '';
            i = Object.keys(notes).length;
            if (i == 1) txt = 'You don\'t have any notes 🙃';
            else {
                txt = ':ledger: **Your personnal note(s) :**\n';
                for (a = 1; a < i; a++) {
                    n = 'note' + a;
                    txt += '\t• ' + notes[n] + '\n';
                }
            }
            send(msg, txt);
        }
    },

    {
        name: 'clearnote',
        description: 'clear your personnal notes.',
        usage: 'a!clearnote {an integer} (optional)',
        group: 'personal',
        result: (msg, args, profile) => {
            let n = args[0],
                l, numbers, number, newNotesn, entry, c,
                clear = false,
                notes = profile.notes;
            l = Object.keys(notes).length;

            if (/\d+/.test(n)) {
                if (n > 0 && n < 11) {
                    numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'height', 'nine', 'ten'];
                    number = ':' + numbers[n] + ':';
                    if (n == 10) number = ':keycap_ten:';

                    if (l == 1) send(msg, 'You don\'t have any notes 🙃');

                    if ((l - 1) >= n) {
                        clear = true;
                        send(msg, ' note ' + number + ' deleted');
                    } else send(msg, 'Sorry I can\'t find this note');

                    if (clear) {
                        newNotes = {};
                        entry = Object.entries(notes)[n];
                        entry = entry[0];
                        c = -1;
                        for (i in notes) {
                            c++;
                            if (i == entry) {
                                c--;
                                continue;
                            }
                            newNotes['note' + c] = notes[i];
                        }
                        DB.clearNotes(newNotes);
                    }
                } else send(msg, 'Your integer must be between 1 and 10');
            } else {
                newNotes = {
                    note0: "**Your notes:**"
                }
                if (l == 1) send(msg, 'You don\'t have any notes 🙃');
                else {
                    DB.clearNotes(newNotes);
                    send(msg, ':ballot_box_with_check: All notes cleared');
                }
            }
        }
    },

    {
        name: 'daily',
        description: 'Obtain daily xp and money (200 gems and 20xp) each 12 hours.',
        usage: 'a!daily',
        group: 'personal',
        result: (msg, args, profile) => {
            if (msg.content != "a!daily") return;
            let Now = Date.now(),
                oDaily = profile.data,
                daily = profile.delay.daily;


            if (Now - daily >= 43200000) {
                daily = Now;

                send(msg, 'You received **20xp** and **200**:gem: !\nNext daily available in : **' + mtsm(43200000 - (Now - daily)) + '** :hourglass_flowing_sand:');
                oDaily.xp += 20;
                oDaily.money += 200;
                while (Math.pow(oDaily.level, 2.3) * 10 < oDaily.xp) {
                    oDaily.level++;
                }

                DB.updateData('data', oDaily);
                DB.updateData('delay/daily', daily);
            } else send(msg, 'You need to wait **' + mtsm(43200000 - (Now - daily)) + '** for the next daily ! :hourglass:');
        }
    },

    {
        name: 'money',
        description: 'show your personal gems.',
        usage: 'a!money',
        group: 'personal',
        result: (msg, args, profile) => {
            if (msg.content != "a!money") return;
            let money = profile.data.money;

            send(msg, 'You currently have ' + money + ':gem:');
        }
    },

    {
        name: 'profile',
        description: 'show a profile',
        usage: 'a!profile',
        group: 'personal',
        result: (msg, args, profile) => {
            let iID, sUSER;
            if (msg.content == 'a!profile') {
                getProfile(msg, profile)
            } else if (args.length == 1) {
                iID = args[0].replace(/<@!?(\d+)>/, '$1');
                getProfile(msg, iID);
            }
        }
    },

    {
        name: 'level',
        description: 'Show level of a person',
        usage: 'a!level {tag} (optional)',
        group: 'personal',
        result: (msg, args, profile) => {
            let avatar = msg.author.avatarURL,
                name = msg.author.username + '#' + msg.author.discriminator,
                embed, id;

            if (msg.content == 'a!level') {
                if (avatar === null) avatar = 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349';
                embed = new Discord.RichEmbed()
                    .setColor(0x333333)
                    .setAuthor(name, avatar)
                    .addField('Level', profile.data.level, true)
                    .addField('Exp.', profile.data.xp, true);
                send(msg, embed);
            } else if (args.length == 1) {
                id = args[0].replace(/<@!?(\d+)>/, '$1');
                DB.profile(id).getData('user/name', function(data) {
                    data = data.val();

                    if (data === null) {
                        send(msg, 'This user does not have an account :frowning:');
                    } else {
                        bot.fetchUser(id).then(user => {
                            name = user.username + '#' + user.discriminator;
                            avatar = user.avatarURL;
                            if (avatar === null) avatar = 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349';

                            DB.getData('data', function(data) {
                                data = data.val();
                                let embed = new Discord.RichEmbed()
                                    .setColor(0x333333)
                                    .setAuthor(name, avatar)
                                    .addField('Level', data.level, true)
                                    .addField('Exp.', data.xp, true)
                                send(msg, embed);
                            });
                        });
                    }
                });
            }
        }
    },

    {
        name: 'color',
        description: 'Personalize your profile embed color',
        usage: 'a!color #FFFFFF or a!color 0xFFFFFF',
        group: 'personal',
        result: (msg, args) => {
            if (args.length == 0) send(msg, 'Not possible to set a color :cry:');
            let color = args[0],
                c, embed;

            if (/(#|0x)?([a-f0-9A-F]{3}){1,2}/.test(color)) {
                c = color.replace(/#|0x/, '');
                if (c.length == 3) c = '0x' + c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
                else c = '0x' + c;

                embed = new Discord.RichEmbed()
                    .setColor(c)
                    .setDescription('Color updated (' + c + ')');
                send(msg, embed);
                DB.updateData('choices/color', c);
            } else send(msg, 'color couldn\'t be found.');
        }
    },

    {
        name: 'desc',
        description: 'set your description',
        usage: 'a!desc {your description}',
        group: 'personal',
        result: (msg, args) => {
            if (args.length == 0) return;
            let desc = args.join(" ");

            if (desc.length < 26) {
                DB.updateData('param/desc', desc);
                send(msg, 'Description saved');
            } else send(msg, 'Your description is too long sorry :cry: (26 char max)');
        }
    }
];

module.exports = personal;