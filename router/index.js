/**
 * Created by Fairy on 2018/12/3.
 */
const express = require('express');
const Users = require('../model/users');
const cookieParser = require('cookie-parser')
const router = new express.Router();
const md5 = require('blueimp-md5');

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

module.exports = router;
