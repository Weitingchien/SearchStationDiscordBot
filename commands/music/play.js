const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core-discord');
const ytpl = require('ytpl'); //搜尋playlist
const ytSearch = require('yt-search');
const formatSecond = require('../.././plugin/timeTransformer'); //秒數轉時分秒
const thousandsSeparators = require('../../plugin/thousandsSeparators'); //千分位分隔符號

const videoPlayer = async (guild, song, client, channel, fastForward) => {
  //只有songList則代入情形會變成song => {} songList => ['https://www.youtube.com/watch?v=kQvT37OzkP8','https://www.youtube.com/watch?v=vzhTpIIQR5I','https://www.youtube.com/watch?v=TcLLpZBWsck'......]
  //只有song => {isUrl: true,title: 'Fujii Kaze - Seishun Sick (Official Video)',url: 'https://www.youtube.com/watch?v=kQvT37OzkP8',views: '6,404,566',duration: '7:58',publishDate: '2020-12-11',requester: 'WeiTing'} songList => []
  const searching = await channel.send('Searching...');
  const songQueue = client.queue.get(guild.id); //回傳一個queueConstructor的物件

  if (!song) {
    //song在!stop會被清空 => Boolean([{}]) === true
    searching.delete();
    client.queue.delete(guild.id);
    songQueue.voiceChannel.leave();
    return;
  }

  try {
    const stream = await ytdl(song.shortUrl || song.url);
    songQueue.connection
      .play(stream, { type: 'opus', highWaterMark: 15 })
      .on('finish', () => {
        songQueue.songList.shift();
        videoPlayer(guild, songQueue.songList[0], client, channel);
      });
    searching.delete();
    const songAdded = new MessageEmbed();
    songAdded
      .setColor('#FF0000')
      .setTitle(song.title)
      .setAuthor('Now playing', client.config.CDIconUrl)
      .addFields(
        {
          name: 'Author',
          value: song.author.name || song.author,
          inline: true
        },
        { name: 'Duration', value: song.duration, inline: true }
      )
      .setFooter(
        `${`${song.index}/${songQueue.songList.length}`}`,
        client.config.youtubeIconUrl
      );
    if (fastForward) {
      song.durationSec = fastForward;
    }
    await channel
      .send(songAdded)
      .then(msg => msg.delete({ timeout: song.durationSec * 1000 }));
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
    const channel = client.channels.cache.get('855172507250589726');
    const voiceChannel = message.member.voice.channel; //成員必須在語音頻道
    const serverQueue = client.queue.get(message.guild.id); //message.guild.id為伺服器ID
    const urlArray = args[0].split(/list=/i)[1]; //i表示不管大小寫

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
      const songList = [];
      //判斷是不是網址
      if (ytdl.validateURL(args[0]) || args[0].match(/\?/)) {
        //str.match(正則表達式) ， 如果網址當中含有?list=PL或&list= (使用\轉義特殊符號，因為要用來判斷是否含有?號，在正則表達式當中的?號代表重複前面內容的0次或一次)
        if (args[0].match(/\?list=PL/i) || args[0].match(/&list=PL/i)) {
          //let traverseTimes = 0;
          const playlist = await ytpl(urlArray, { pages: 1 }); //List:playList的ID
          console.log('playlist searching');
          playlist.items.forEach(el => {
            //traverseTimes += 1;
            songList.push(el);
            //songList[traverseTimes].requester = message.author.username;
            //songList.push(el.shortUrl);
          });
        } else {
          const songInfo = await ytdl.getInfo(args[0]);
          song = {
            index: songList.length + 1,
            isUrl: true,
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            views: thousandsSeparators(songInfo.videoDetails.viewCount),
            duration: formatSecond(songInfo.videoDetails.lengthSeconds),
            durationSec: songList.length_seconds,
            publishDate: songInfo.videoDetails.publishDate,
            requester: message.author.username
          };
        }

        // If the video is not a URL then use keywords to find that video.
      } else {
        const videoFinder = async query => {
          const videoResult = await ytSearch(query);
          return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };
        const video = await videoFinder(args.join(' '));
        if (video) {
          song = {
            index: songList.length + 1,
            isUrl: false,
            title: video.title,
            url: video.url,
            description: video.description,
            thumbnail: video.thumbnail,
            duration: video.timestamp,
            durationSec: video.seconds,
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
          songList: songList
        };
        client.queue.set(message.guild.id, queueConstructor);
        queueConstructor.songList.push(song);
        try {
          const connection = await voiceChannel.join(); //對應到第79行的play，等待機器人連線才能播放
          queueConstructor.connection = connection;
          videoPlayer(
            message.guild,
            queueConstructor.songList[0],
            client,
            channel
          );
        } catch (err) {
          client.queue.delete(message.guild.id);
          channel.send('❌:There was an error connecting!');
          throw err;
        }
      } else {
        serverQueue.songList.push(song);
        channel.send(`🎶 ${song.title} added to queue!`);
      }
    }
  }
};
