/**
 * Created by Fairy on 2018/12/3.
 */
const express = require('express');
const router = require('./router');
const db = require('./db');
const app = express();


(async() => {
  await db
  app.use(router);
})();


app.listen(4000, err => {
  if(!err) console.log('服务器启动成功了~请访问:http://localhost:4000');
  else console.log(err);
})