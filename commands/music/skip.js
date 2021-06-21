module.exports = {
  name: 'skip',
  cooldown: 1,
  description: 'Skip current song',
  //permissions: ['CONNECT'],
  async execute(client, message) {
    const channel = client.channels.cache.get('855172507250589726');
    const songQueue = client.queue.get(message.guild.id); //回傳一個queueConstructor的物件
    if (!message.member.voice.channel) {
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    }
    if (!songQueue) {
      return channel.send({
        embed: { description: 'There are no songs in queue' }
      });
    }
    if (songQueue.connection.dispatcher.paused) {
      return channel.send({
        embed: { description: 'You need to resume song before you skip' }
      });
    }
    songQueue.connection.dispatcher.end();
  }
};
