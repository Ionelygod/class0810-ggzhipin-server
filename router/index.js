/**
 * Created by Fairy on 2018/12/3.
 */
const express = require('express');
const Users = require('../models/users');
const cookieParser = require('cookie-parser')
const router = new express.Router();
const md5 = require('blueimp-md5');
const Messages = require('../models/messages')

router.use(express.urlencoded({extended: true}));
router.use(cookieParser());

router.get('/',(req, res) => {
res.send('这是服务器返回的响应012');
})
router.post('/register',async (req, res) => {
  const {username, password, type} = req.body;
  const user = await Users.findOne({username});
  try {
    if(user){
      res.json({
        code:1,
        msg:'用户名已注册'
      })
    }else {
      const user = await Users.create({username, password:md5(password), type});
      res.cookie('userid', user.id, {maxAge: 1000 * 3600 * 24 * 7})
      res.json({
        code:0,
        data:{
          username:user.username,
          _id : user.id,
          type: user.type
        }
      })
    }
  } catch (e) {
    console.log(e);
    res.json({
      code:2,
      msg:'网络不稳定，请刷新'
    })
  }

})

router.post('/login',async (req,res) => {
  const {username, password} = req.body;
  const user = await Users.findOne({username,password:md5(password)});
  try {
    if(user){
      res.cookie('userid', user.id, {maxAge: 1000 * 3600 * 24 * 7})
        res.json({
          code:0,
          data:{
            _id:user.id,
            type:user.type,
            username:user.username,
            header:user.header,
            salary:user.salary,
            post:user.post,
            info:user.info,
            company:user.company
          }
        })
    }else {
      res.json({
        code:1,
        msg:'用户名或密码错误'
      })
    }
  } catch (e) {
    console.log(e);
    res.json({
      code:2,
      msg:'网络不稳定，请刷新'
    })
  }

})

router.post('/update', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  console.log(userid);
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.json({code: 1, msg: '请先登陆'});
  }
  // 存在, 根据userid更新对应的user文档数据
  // 得到提交的用户数据
  const user = req.body // 没有_id
  Users.findByIdAndUpdate({_id: userid}, {$set: user})
    .then(oldUser => {
      if (!oldUser) {
        //更新数据失败
        // 通知浏览器删除userid cookie
        res.clearCookie('userid');
        // 返回返回一个提示信息
        res.json({code: 1, msg: '请先登陆'});
      } else {
        //更新数据成功
        // 准备一个返回的user数据对象
        const {_id, username, type} = oldUser;
        console.log(oldUser);
        //此对象有所有的数据
        const data = Object.assign({_id, username, type}, user)
        // 返回成功的响应
        res.json({code: 0, data})
      }
    })
    .catch(error => {
      // console.error('登陆异常', error)
      res.send({code: 2, msg: '网络不稳定，请重新试试~'})
    })
})
router.get('/user', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.send({code: 1, msg: '请先登陆'})
  }
  // 根据userid查询对应的user
  Users.findOne({_id: userid}, {__v: 0, password: 0})
    .then(user => {
      if (user) {
        res.send({code: 0, data: user})
      } else {
        // 通知浏览器删除userid cookie
        res.clearCookie('userid')
        res.send({code: 1, msg: '请先登陆'})
      }
    })
    .catch(error => {
      console.error('获取用户异常', error)
      res.send({code: 1, msg: '获取用户异常, 请重新尝试'})
    })
})

// 获取用户列表(根据类型)
router.get('/userlist', (req, res) => {
  const {type} = req.query
  Users.find({type}, {__v:0, password:0})
    .then(data => {
      res.send({code: 0, data})
    })
    .catch(error => {
      console.error('获取用户列表异常', error)
      res.send({code: 1, msg: '获取用户列表异常, 请重新尝试'})
    })
})



/*
 获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', (req, res) => {
  // 获取cookie中的userid
  const userid = req.cookies.userid;

  let users;
  // 查询得到所有user文档数组
  Users.find()
    .then(userDocs => {
      // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
      users = userDocs.reduce((prev, curr) => {
        prev[curr._id] = {username: curr.username, header: curr.header}
        return prev
      }, {})
      /*
       查询userid相关的所有聊天信息
       参数1: 查询条件
       参数2: 过滤条件
       参数3: 回调函数
       */
      return Messages.find({'$or': [{from: userid}, {to: userid}]}, {__v:0, password:0})
    })
    .then(chatMsgs => {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users, chatMsgs}})
    })
    .catch(error => {
      console.error('获取消息列表异常', error)
      res.send({code: 1, msg: '获取消息列表异常, 请重新尝试'})
    })
})

/*
 修改指定消息为已读
 */
router.post('/readmsg', (req, res) => {
  // 得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userid
  /*
   更新数据库中的msg数据
   参数1: 查询条件
   参数2: 更新为指定的数据对象
   参数3: 是否1次更新多条, 默认只更新一条
   参数4: 更新完成的回调函数
   */
  Messages.update({from, to, read: false}, {read: true}, {multi: true})
    .then(doc => {
      console.log('/readmsg', doc)
      res.send({code: 0, data: doc.nModified}) // 更新的数量
    })
    .catch(error => {
      console.error('查看消息列表异常', error)
      res.send({code: 1, msg: '查看消息列表异常, 请重新尝试'})
    })
})

module.exports = router;
