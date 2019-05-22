const mongoose = require('../db')

// 创建 schema
const Schema = mongoose.Schema

// 定义 article schema
const articleSchema = new Schema({
  title: String, // 文章名称
  description: String, // 文章简介
  content: String, // 文章文件初始内容
  body: String, // 文章内容
  image: String, // 文章首屏图片
  tags: {type: Array, default: []}, // 文章标签
  createdAt: { type: Date, default: Date.now }, // 创建时间
  updatedAt: { type: Date, default: Date.now }, // 更新时间
  author: { type:String, default: 'Joiner'}, // 作者
  type: String, // 储存类型
  folder: String,
  isStarred: Boolean,
  isTrashed: Boolean,
  key: String,
  storage: String,
  linesHighlighted: {type: Array, default: []},
  meta: {
    votes: { type:Number, default: 0}, // 访问人数
    favs: { type:Number, default: 0}, // 点赞人数
  },
  articleId: Number,
  status: { type: Number, default: 1}, // 文章状态
  publish: { type: Boolean, default: false}, // 文章是否在网站发布
})

/* 自增 */
const counterSchema = Schema({
  _id: {type: String, required: true},
  seq: {type: Number, default: 0},
})
const counter = mongoose.model('counter', counterSchema)
// counter.create({_id: 'articleId'})
// 设置自增 articleId 中间件

articleSchema.pre('save', function(next) {
  counter.findByIdAndUpdate({_id: 'articleId'}, {$inc: { seq: 1} }, (err, counter) => {
    if(err) return next(error);
    this.articleId = counter.seq;
    next();
  });
})

// Article 是数据库中 模型集合 `articles` 的单数形式, 
// 如果模型集合中没有 `articles` 会创建
const ArticleModel = mongoose.model('Article', articleSchema)

module.exports = ArticleModel