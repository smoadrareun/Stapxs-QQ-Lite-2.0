/*
    title: 自动回应
*/

const blacklist = [];

if (this.cacheValues['lastSendTime'] == undefined) {
  this.cacheValues['lastSendTime'] = 0
}

// 上次发送时间距现在超过三秒才会触发
if (new Date().getTime() - this.cacheValues['lastSendTime'] > 3000) {
  const id = this.msgInfo.group_id ?? this.msgInfo.private_id;
  if (this.isMe && blacklist.indexOf(id) === -1) {
    this.cacheValues['lastSendTime'] = new Date().getTime()
    this.sendMsg('set_msg_emoji_like', {
      'message_id': this.message.message_id,
      'emoji_id': '66'
    });
  }
}