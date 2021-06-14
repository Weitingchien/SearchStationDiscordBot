module.exports = {
  name: 'stop',
  cooldown: 0,
  description: 'stop song',
  async execute(client, message) {
    const channel = client.channels.cache.get('853660743433453599');
    const songQueue = client.queue.get(message.guild.id); //回傳一個queueConstructor的物件
    if (!message.member.voice.channel) {
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    }
    songQueue.songs = [{}];
    songQueue.connection.dispatcher.end('Stopped!');
  }
};
