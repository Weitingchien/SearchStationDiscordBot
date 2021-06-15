const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'pause',
  cooldown: 0,
  description: 'Pause song',
  execute(client, message) {
    const channel = client.channels.cache.get('853660743433453599');
    const songQueue = client.queue.get(message.guild.id); //回傳一個queueConstructor的物件
    if (!message.member.voice.channel) {
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    }
    if (!songQueue) {
      return channel.send({
        embed: { description: 'There is nothing playing right now to pause' }
      });
    }
    songQueue.connection.dispatcher.pause();
    const songPause = new MessageEmbed()
      .setColor('#FF0000')
      .setDescription(
        `⏸ If you want to continue play music Please use \`!resume\``
      );
    channel.send(songPause);
  }
};
