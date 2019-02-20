const checkPerms = function(arr) {
    let e = "";
    var c = {
        8 : "admin",
        128 : "view audit log",
        32 : "manage server",
        268435456 : "manage roles",
        16 : "manage channels",
        2 : "kick members",
        4 : "ban members",
        1 : "create instant invite",
        67108864 : "change nickname",
        134217728 : "manage nicknames",
        1073741824 : "manage emojis",
        536870912 : "manage webhooks",
        1024 : "read messages",
        4096 : "send tts messages",
        16384 : "embed links",
        65536 : "read message history",
        262144 : "use external emojis",
        2048 : "send messages",
        8192 : "manage messages",
        32768 : "attach files",
        131072 : "mention @everyone",
        64 : "add reactions",
        1024 : "view channel (voice)",
        1048576 : "connect (voice)",
        4194304 : "mute members (voice)",
        16777216 : "move members (voice)",
        2097152 : "speak (voice)",
        8388608 : "deafen members (voice)",
        33554432 : "use voice activity"
    }

	for(let d=0; d<arr.length; d++) {
		if(d==arr.length-1) {
			e += (c[arr[d]]);
		} else {
			e += (c[arr[d]])+", ";
		}
	}
	return e;
};

module.exports = checkPerms;