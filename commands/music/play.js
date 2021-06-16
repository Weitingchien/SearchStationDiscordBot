const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');
const formatSecond = require('../.././plugin/timeTransformer'); //秒數轉時分秒
const thousandsSeparators = require('../../plugin/thousandsSeparators'); //千分位分隔符號

const videoPlayer = async (guild, song, client, channel) => {
  const searching = await channel.send('Searching...');
  const songQueue = client.queue.get(guild.id); //回傳一個queueConstructor的物件
  if (!song) {
    searching.delete();
    client.queue.delete(guild.id);
    songQueue.voiceChannel.leave();
    return;
  }
  try {
    const stream = await ytdl(song.url);
    songQueue.connection
      .play(stream, { type: 'opus', highWaterMark: 15 }) //使用opus編碼器，代表運行時不需要FFmpeg轉碼器
      .on('finish', () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0], client, channel); //當播放完一首曲子再繼續把剩下的曲子放完
      });
    const songAdded = new MessageEmbed();
    if (song.isUrl === true) {
      searching.delete();
      return;
    }
    songAdded
      .setColor('#FF0000')
      .setTitle(song.title)
      .setAuthor('Now playing', client.config.CDIconUrl)
      .setThumbnail(song.thumbnail)
      .setDescription(song.description)
      .addFields(
        { name: 'Author', value: song.author, inline: true },
        { name: 'Views', value: song.views, inline: true },
        { name: 'Duration', value: song.duration, inline: true }
      )
      .setFooter(`Upload: ${song.ago}`, client.config.youtubeIconUrl);
    await channel.send(songAdded);
    searching.delete();
  } catch (err) {
    throw err;
  }
};

module.exports = {
  name: 'play',
  aliases: ['p'],
  cooldown: 0,
  description: 'Play music',
  //permissions: ['CONNECT', 'SPEAK'],
  //導出videoPlayer函式表達式給skip
  videoPlayer,
  async execute(client, message, cmd, args) {
    const channel = client.channels.cache.get('853660743433453599');
    const voiceChannel = message.member.voice.channel; //成員必須在語音頻道
    const serverQueue = client.queue.get(message.guild.id); //message.guild.id為伺服器ID
    if (!voiceChannel)
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    const permissions = voiceChannel.permissionsFor(message.client.user); //獲取此頻道中成員整體權限集
    if (!permissions.has('CONNECT'))
      return channel.send('You dont have the correct permissions');
    if (!permissions.has('SPEAK'))
      return channel.send('You dont have the correct permissions');

    if (cmd === 'play' || cmd === 'p') {
      if (!args.length)
        return channel.send('You need to send the second argument');
      let song = {};
      if (ytdl.validateURL(args[0])) {
        const songInfo = await ytdl.getInfo(args[0]);
        //console.log(songInfo);
        song = {
          isUrl: true,
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          views: thousandsSeparators(songInfo.videoDetails.viewCount),
          duration: formatSecond(songInfo.videoDetails.lengthSeconds),
          publishDate: songInfo.videoDetails.publishDate,
          requester: message.author.username
        };
        // If the video is not a URL then use keywords to find that video.
      } else {
        const videoFinder = async query => {
          const videoResult = await ytSearch(query);
          return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };
        const video = await videoFinder(args.join(' '));
        console.log(video);
        if (video) {
          song = {
            isUrl: false,
            title: video.title,
            url: video.url,
            description: video.description,
            thumbnail: video.thumbnail,
            duration: video.timestamp,
            ago: video.ago,
            views: thousandsSeparators(video.views),
            author: video.author.name,
            requester: message.author.username
          };
        } else {
          channel.send('Error finding video!');
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
          videoPlayer(
            message.guild,
            queueConstructor.songs[0],
            client,
            channel
          );
        } catch (err) {
          client.queue.delete(message.guild.id);
          channel.send('❌:There was an error connecting!');
          throw err;
        }
      } else {
        serverQueue.songs.push(song);
        channel.send(`🎶 ${song.title} added to queue!`);
      }
    }
  }
};
