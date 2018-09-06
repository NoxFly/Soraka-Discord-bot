let command = [
    {
        name: 'Thaloz',
        result: (msg) => {
            msg.channel.send({
				files: [
				  "./bots/caitlyn/kalyoz2.png"
				]
			  })
        }
    },

    {
        name: 'kayloz',
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