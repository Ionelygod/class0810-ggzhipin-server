/**
 * Created by Fairy on 2018/12/7.
 */
const Messages = require('../models/messages');
module.exports = function (server) {
  // 得到IO对象
  const io = require('socket.io')(server)
  // 监视连接(当有一个客户连接上时回调)
  io.on('connection', function (socket) {
    console.log('soketio connected')
    // 绑定sendMsg监听, 接收客户端发送的消息
    socket.on('sendMsg',async function (data) {
      console.log('服务器接收到浏览器的消息', data)
      const {message, from, to} = data;
      const from_to = [from, to].sort().join('-');
      const result = await Messages.create({message, from, to, from_to})
      // 向客户端发送消息(名称, 数据)
      io.emit('receiveMsg',result)
      console.log('服务器向浏览器发送消息', data)
    })
  })
}