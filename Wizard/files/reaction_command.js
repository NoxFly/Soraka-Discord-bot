const Discord = require('discord.js');
const main = require('./../bot.js');
const bot = main.bot;
const DB = main.database;
const firebase = require('firebase');
const items = require('./json/items.json');
const check = require('./check.js');

const reaction_command = function(reaction, user, profile) {
    let object = {};
    for(i in items) {
        let item = items[i].id;
        if(item==reaction.emoji.id) {
            object = {
                name: items[i].name,
                id: items[i].id,
                price: items[i].price
            };
        }
    }
    
    traitement(reaction, user, profile, object);
}

function traitement(reaction, user, profile, object) {
    console.log("price: "+object.price+" | your money: "+profile.game.galleons);
    if(profile.game.galleons < object.price) {
        bot.users.get(user.id).send("You don't have enought money to paid the `"+object.name.replace(/_/g, " ")+"`");
    } else {
        bot.users.get(user.id).send("You bought "+(object.name.replace(/_/gi, " "))+" !");

        let galleons = profile.game.galleons - object.price;
        let inventory = profile.game.inventory + " "+object.name;
        
        let game = profile.game;
        game.inventory = inventory;
        game.galleons = galleons;

        DB.profile(user.id).updateData('game', game);
    }
}

module.exports = reaction_command;