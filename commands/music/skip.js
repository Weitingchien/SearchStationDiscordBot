const { videoPlayer } = require('./play');

module.exports = {
  name: 'skip',
  cooldown: 0,
  description: 'Skip current song',
  //permissions: ['CONNECT'],
  async execute(client, message) {
    const channel = client.channels.cache.get('853660743433453599');
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
    songQueue.songs.shift();
    songQueue.connection.dispatcher.destroy();
    videoPlayer(message.guild, songQueue.songs[0], client, channel);
  }
};
