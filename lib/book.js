
const { doDownload, checkStatus, clearDownloadJob } = require('./doDownload')
/* models */
const { updateOneBook, getBook } = require('../models/book')

async function download(book) {
  //  查看是否有book
  const dataBaseBook = await getBook(book)
  if (!dataBaseBook) {// 存在 则直接下载
    doDownload(book).then(function (bookData) {
      if (bookData) {
        updateOneBook(bookData) // 不需要等待下载完成，直接返回 null , 通过 checkstatus 检查下载进度
      }
    })
    return null
  }
  return dataBaseBook
}



module.exports = {
  download,
  checkStatus,
  clearDownloadJob,
}