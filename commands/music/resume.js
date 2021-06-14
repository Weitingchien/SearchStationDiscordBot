const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'resume',
  cooldown: 0,
  description: 'resume song',
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
        embed: { description: 'There is nothing playing right now to resume' }
      });
    }
    songQueue.connection.dispatcher.resume();
    const songResume = new MessageEmbed()
      .setColor('#FF0000')
      .setDescription(`▶️ If you want to pause music Please use \`!pause\``);
    channel.send(songResume);
  }
};
