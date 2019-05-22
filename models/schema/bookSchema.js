const mongoose = require('../db')

const counter = require('./counterSchema')
// 创建 schema
const Schema = mongoose.Schema

// 定义 Books schema
const bookSchema = new Schema({
  bid: Number,
  bName: String,
  bAuth: String,
  desc: { type: String, default: '' },
  cat: { type: String, default: '' },
  catId: { type: String, default: '' },
  cnt: { type: Number, default: -1 },
  updateTime: { type: Date, default: Date.now },
  currentPageName: String,
  currentPage: Number,
  image: String,
  url: String,
  baseUrl: String,
  status: { type: Number, default: 1 }, // 小说状态 完本 连载
  public: { type: Number, default: 1 } // 控制展示展示
})

bookSchema.pre('save', function(next) {

  counter.addNumber( 'bid', (err, data) => {
    if (err) return next()
    this.bid = data.seq;
    next();
  })
})

// BookModel 是数据库中 模型集合 `Books` 的单数形式, 
// 如果模型集合中没有 `Books` 会创建
const bookModel = mongoose.model('Books', bookSchema)

module.exports = bookModel