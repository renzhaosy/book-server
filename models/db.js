const mongoose = require('mongoose')

const baseUrl = 'mongodb://localhost:27017/books'

// 创建一个数据库连接
mongoose.connect(`${baseUrl}`, {
  useNewUrlParser: true,
})

mongoose.connection.on('connected', () => {
  console.log(`数据库连接成功 : ${baseUrl}`) 
})

mongoose.connection.on('error', (err) => {
  console.log(`数据库连接失败`)
  throw err 
})

mongoose.connection.on('disconnected', () => {
  console.log(`mongoose  disconnected: ${baseUrl}`) 
})

// <Ctrl>+C  触发关闭 关闭数据连接
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})


module.exports = mongoose