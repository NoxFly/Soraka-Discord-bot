let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
const Discord = require('discord.js');

const react = function(cmds,reaction,user,content) {
    for(let a = 0;a<cmds.length;a++) {
        //la commande est mise dans une variable command
        let command = cmds[a];
        //si on retrouve bien le nom de la commande
        if (find(content, command.from, true) && reaction.emoji.name === command.emoji) {
            //on associe le texte à la fonction definie par la commande
            let txt = command.result(reaction,user);
            //on envoie le texte dans le channel
            if(txt != null){
              send(reaction.message, txt);
            }
        }
    }
}

module.exports = react;