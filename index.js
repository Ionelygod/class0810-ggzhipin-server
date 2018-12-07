/**
 * Created by Fairy on 2018/12/3.
 */
const express = require('express');
const router = require('./router');
const db = require('./db');
const app = express();


const http = require('http')
const server = http.createServer(app)
require('./socketIO')(server)

server.listen('5000', () => {
  console.log('服务器启动成功, 请访问: http://localhost:5000')
})

;(async() => {




  await db
  app.use(router);
})();


app.listen(4000, err => {
  if(!err) console.log('服务器启动成功了~请访问:http://localhost:4000');
  else console.log(err);
})