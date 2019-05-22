const mongoose = require('../db')

// 创建 schema
const Schema = mongoose.Schema

/* 自增 */
const counterSchema = Schema({
  _id: {type: String, required: true},
  seq: {type: Number, default: 0},
})


counterSchema.statics = {
  addNumber(id, cb) {
    this.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          seq: 1 //每次自增长1
        }
      },
      {
        new: true, //设置true 获取的是更新之后的值
        upsert: true, // create the obj if it doesn't exist
      },
      cb
    );
  }
}

const counter = mongoose.model('counter', counterSchema)

module.exports = counter