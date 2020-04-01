module.exports = class Command {
	clientAdmin = '316639200462241792'; // if the bot author wanna use the private commands

    parse(message, args) {
        if(this.match(args)) {
            this.action(message, args);
            return true;
        }
        return false;
    }
}