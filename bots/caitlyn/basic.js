let command = [
    {
        name: 'Thaloz',
        result: (msg) => {
            msg.channel.send({
				files: [
				  "./bots/caitlyn/kayloz.png"
				]
			  })
        }
    },

    {
        name: 'kayloz',
        result: (msg) => {
            msg.channel.send({
				files: [
				  "./bots/caitlyn/kayloz.jpg"
				]
			  })
        }
    }
];

module.exports = command;