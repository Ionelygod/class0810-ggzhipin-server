/**
 * Created by Fairy on 2018/12/3.
 */
const express = require('express');
const Users = require('../model/users');
const router = new express.Router();
const md5 = require('blueimp-md5');

router.use(express.urlencoded({extended: true}));

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
        res.json({
          code:0,
          data:{
            _id:user.id,
            type:user.type,
            username:user.username
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

module.exports = router;
