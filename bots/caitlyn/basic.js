let command = [
    {
        name: 'Thaloz',
        result: (msg) => {
            msg.channel.send({
				files: [
				  "./bots/caitlyn/kalyoz.png"
				]
			  })
        }
    },

    {
        name: 'kalyoz',
        result: (msg) => {
            msg.channel.send({
				files: [
				  "./bots/caitlyn/kalyoz.jpg"
				]
			  })
        }
    }
];

module.exports = command;