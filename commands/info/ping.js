const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'ping',
  category: 'info',
  description: 'Return latency and API ping',

  execute: async (client, message, args) => {
    const msg = await message.channel.send(`Pinging...`);
    const embed = new MessageEmbed()
      .setColor('#e70000')
      .setTitle('Pong')
      .setDescription(
        `WebSocket ping is ${
          client.ws.ping
        }ms,Message edit ping is ${Math.floor(
          msg.createdAt - message.createdAt
        )}ms!`
      );
    await message.channel.send(embed);
    msg.delete();
  }
};
