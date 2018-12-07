/**
 * Created by Fairy on 2018/12/7.
 */
/*
 能操作msgs集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')

//2. 定义msgs集合的文档结构
const msgSchema = new mongoose.Schema({
  from: {// 发送用户的id
    type: String,
    required: true
  },
  to: {// 接收用户的id
    type: String,
    required: true
  },
  from_to: {// from和to组成的字符串
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }, // 内容
  read: {// 标识是否已读
    type: Boolean,
    default: false
  },
  createTime: {// 创建时间
    type: Number,
    default:Date.now
  }
})

//3. 向外暴露Model
module.exports = mongoose.model('messages', msgSchema);
