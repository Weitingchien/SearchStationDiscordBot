const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const videoPlayer = async (guild, song, client) => {
  const songQueue = client.queue.get(guild.id); //回傳一個queueConstructor的物件
  if (!song) {
    songQueue.voiceChannel.leave();
    client.queue.delete(guild.id);
  }
  const stream = await ytdl(song.url, {
    filter: 'audioonly'
  });
  songQueue.connection
    .play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
      songQueue.songs.shift();
      videoPlayer(guild, songQueue.songs[0]); //當播放完一首曲子再繼續把剩下的曲子放完
    });
};

module.exports = {
  name: 'play',
  description: 'play music',
  cooldown: 0,
  async execute(client, message, cmd, args) {
    const voiceChannel = message.member.voice.channel; //成員必須在語音頻道
    let song = {};
    if (!voiceChannel)
      return message.channel.send(
        'You need to be in a channel to execute this command!'
      );
    const permissions = voiceChannel.permissionsFor(message.client.user); //獲取此頻道中成員整體權限集
    const serverQueue = client.queue.get(message.author.id);
    console.log(permissions);
    if (!permissions.has('CONNECT'))
      return message.channel.send('You dont have the correct permissions');
    if (!permissions.has('SPEAK'))
      return message.channel.send('You dont have the correct permissions');
    if (cmd === 'play') {
      if (!args.length)
        return message.channel.send('You need to send the second argument');
      if (ytdl.validateURL(args[0])) {
        const songInfo = await ytdl.getInfo(args[0]);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url
        };
        // If the video is not a URL then use keywords to find that video.
      } else {
        const videoFinder = async query => {
          const videoResult = await ytSearch(query);
          return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };
        const video = await videoFinder(args.join(' '));
        if (video) {
          song = { title: video.title, url: video.url };
        } else {
          message.channel.send('Error finding video!');
        }
      }
      if (!serverQueue) {
        const queueConstructor = {
          voiceChannel,
          textChannel: message.channel, //使用者在此頻道下指令
          connection: null,
          songs: [] //歌曲會加入到此queueConstructor的song array裡面
        };
        client.queue.set(message.guild.id, queueConstructor);
        queueConstructor.songs.push(song);
        try {
          const connection = await voiceChannel.join(); //對應到第79行的play，等待機器人連線才能播放
          queueConstructor.connection = connection;
          videoPlayer(message.guild, queueConstructor.songs[0], client);
        } catch (err) {
          client.queue.delete(message.guild.id);
          message.channel.send('There was an error connecting!');
          throw err;
        }
      } else {
        serverQueue.songs.push(song);
        return message.channel.send(
          ` :youtube_icon: ${song.title} added to queue!`
        );
      }
    }
  }
};
