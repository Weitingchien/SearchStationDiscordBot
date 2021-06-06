module.exports = async (client, message) => {
  //使用slice()切除前綴: !ping會變成ping，使用trim()刪除空格、使用split(/ +/)處理可能出現的重複空格
  const args = message.content
    .slice(process.env.DISCORD_Bot_Prefix.length)
    .trim()
    .split(/ +/);
  //使用shift()獲取陣列中的第一個元素
  const command = args.shift().toLowerCase();
  if (!client.commands.has(command)) return; //如果client.commands集合裡沒有這個命令就return
  if (!message.content.startsWith(process.env.DISCORD_Bot_Prefix)) return; //如果開頭沒有prefix就return

  try {
    //client.commands.get(command)會返回一個物件，裡面有我們模組內自定義的內容
    client.commands.get(command).execute(client, message, args); //執行對應指令的execute方法
  } catch (err) {
    console.error(err);
    message.reply('There was an error trying to execute that command!');
  }
};
