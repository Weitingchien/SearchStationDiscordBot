module.exports = {
  name: 'stop',
  cooldown: 0,
  description: 'Stop song',
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
        embed: { description: 'There are no songs need to stop' }
      });
    }
    //songQueue.songs = [];
    songQueue.songList = [{}];
    await songQueue.connection.dispatcher.end();
  }
};
