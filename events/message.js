module.exports = async (client, message) => {
  //使用slice()切除前綴: !ping會變成ping，使用trim()刪除空格、使用split(/ +/)處理可能出現的重複空格
  const args = message.content
    .slice(process.env.DISCORD_Bot_Prefix.length)
    .trim()
    .split(/ +/);
  //使用shift()獲取陣列中的第一個元素
  const cmd = args.shift().toLowerCase();
  const command =
    client.commands.get(cmd) ||
    client.commands.find(el => el.aliases && el.aliases.includes(cmd)); //返回一個物件，才能讓我們使用模組內的execute函式
  if (message.channel.type === 'dm') return; //如果是直接消息頻道就return
  if (
    !message.content.startsWith(process.env.DISCORD_Bot_Prefix) ||
    !command ||
    message.author.bot
  )
    return; //如果訊息開頭沒有prefix或是發訊息的是機器人就return

  const allPermissions = [
    'ADMINISTRATOR',
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS'
  ];
  /*   const musicPermissions = message.member.voice.channel.permissionsFor(
    message.client.user
  ); //獲取此頻道中成員整體權限集
  if (command.permissions.length) {
    allPermissions.forEach(el => {
      if (
        command.permissions.includes(el) &&
        message.member.permissions.has(el)
      ) {
        console.log(`You can run this command`);
      } else if (!command.permissions.length) {
        return console.log(`You dont have the correct permissions`);
      }
    });
  } */
  const currentTime = Date.now();
  const timeStamps = client.cooldowns.get(command.name); //先前在SearchStationDiscordBot定義2個Collection，這邊使用到第二個Collection
  const coolDownAmount = (command.cooldown || 2) * 1000;

  if (timeStamps.has(message.author.id)) {
    const expirationTime = timeStamps.get(message.author.id) + coolDownAmount; //當下的時間 + 冷卻時間 = 到期時間
    if (currentTime < expirationTime) {
      const timeLeft = (expirationTime - currentTime) / 1000; //剩餘時間

      return message.reply(
        `Please wait ${timeLeft.toFixed(1)} more seconds before using ${
          command.name
        }`
      );
    }
  }
  timeStamps.set(message.author.id, currentTime); //當使用者發送訊息把當下的時間傳進去
  setTimeout(() => timeStamps.delete(message.author.id), coolDownAmount);

  try {
    command.execute(client, message, cmd, args); //執行對應指令的execute方法
  } catch (err) {
    console.error(err);
    message.reply('There was an error trying to execute that command!');
  }
};
