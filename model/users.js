/**
 * Created by Fairy on 2018/12/3.
 */
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  username:{
    type:String,
    require:true,
    unique:true
  },
  password:{
    type:String,
    require:true,
  },
  type:{
    type:String,
    require:true,
  }
});

module.exports = mongoose.model('Users', usersSchema)
