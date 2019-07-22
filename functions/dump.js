let out = '';
let type;

function send(msg, message) {
	msg.channel.send(message);
}

var dump = function dump(msg,obj) {
    out = "```js\n";
    type = typeof obj;
    out += JSON.stringify(obj,null,'\t');
    out += '\n\nType: '+type+'```';
	display(msg, out);
}

function display(msg, out) {
    send(msg,'**```CONSOLE.LOG```**'+out);
}

module.exports = dump;