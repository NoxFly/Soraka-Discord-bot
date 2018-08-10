let out = '';
let type;

function send(msg, message) {
	msg.channel.send(message);
}

var dump = function dump(msg,obj) {
    //console.log(obj);
    //console.log('\n----------------------------------------------\n');
    out = "```js\n";
    type = typeof obj;
    out += JSON.stringify(obj,null,'\t');
    out += '\n\nType: '+type+'```';
	display(msg, out);
}

function display(msg, out) {
    send(msg,'**```CONSOLE.LOG```**'+out);
    //console.log(out+'\n----------------------------------------------\n');
}

module.exports = dump;