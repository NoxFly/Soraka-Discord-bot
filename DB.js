let firebase = require("firebase");
let main = require('./bot.js');
let bot = main.bot;
const Discord = require('discord.js');
let dump = require('./functions/dump.js');

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

class DB {
    constructor() {
        let config = {
            apiKey: process.env.FIREBASE_TOKEN,
            authDomain: "ahri-561c5.firebaseapp.com",
            databaseURL: "https://ahri-561c5.firebaseio.com",
            projectId: process.env.NAME_FIREBASE,
            storageBucket: "ahri-561c5.appspot.com",
            messagingSenderId: process.env.SENDERID_FIREBASE
        };
        firebase.initializeApp(config);
        let database = firebase.database();
        this.database = database;
        this.serverID = 0;
        this.responseTime = 500;
        this.ref = "";
        this.author = false;
    }

    /* user */

    profile(id) {
        this.ref = '/profile/'+id;
        return this;
    }

    getUser(callback) {
        let ref = this.database.ref(this.ref+'/user/');
        ref.on('value', function(data) {
            callback(data);
        });
        return this;
    }

    setAuthor(author) {
        this.author = author;
    }

    /* get the data */

    getData(way, callback) {
        let ref = this.database.ref(this.ref+'/'+way+'/');
        ref.on('value', function(data) {
            callback(data);
        });
        return this;
    }

    /* set a new data */

    setData(way, obj) {
        this.database.ref(this.ref+'/'+way).set(obj);
    }

    /* add a new data on a plug */

    addData(way, name, obj) {
        this.database.ref(this.ref+'/'+way).child(name).set(obj);
    }

    /* delete data */

    deleteData(way) {
        this.database.ref(this.ref+'/'+way).remove();
    }

    /* notes */

    newNote(c, content) {
        this.database.ref(this.ref+'/notes/'+c).set(content);
    }

    clearNotes(note) {
        this.database.ref(this.ref+'/notes').set(note);
    }

    /* update data */

    updateData(way, data) {
        this.database.ref(this.ref+'/'+way+'/').set(data);
    }

    /* get top of user */

    getTop(callback) {
        let ref = firebase.database().ref('profile/');
        ref.on('child_added', function(data) {
            callback(data);
        });
        return this;
    }

    /* add plug everywhere */

    addPlug(name, obj) {
        this.database.ref(this.ref+'/').child(name).set(obj);
    }

    /* get server */

    server(id) {
        this.ref = 'servers/' +id;
        return this;
    } 

    /* change server settings */

    getServerPerms(server, callback) {
        let ref = firebase.database().ref('servers/'+server);
        ref.on('value', function(data) {
            callback(data);
        });
        return this;
    }

    setServerData(obj) {
        this.database.ref(this.ref+'/').set(obj);
    }

    addPerms(id, way, name, obj) {
        firebase.database().ref('servers/'+id+'/'+way).child(name).set(obj);
    }

    setPerms(id, perms) {
        firebase.database().ref('servers/'+id+'/permsRole').set(perms);
    }

    source(way) {
        this.ref = '';
        return this;
    }
}

module.exports = DB;