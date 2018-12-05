/**
 * Created by Fairy on 2018/12/3.
 */
const mogoose = require('mongoose');
module.exports = new Promise((resolve, reject) => {
  mogoose.connect('mongodb://localhost:27017/ggzhipin',{useNewUrlParser:true});
  mogoose.connection.once('open',err => {
    if(!err) {
      console.log('连接数据库成功了');
      resolve();
    }
    else {
      console.log(err);
      reject(err);
    }
  })
})


