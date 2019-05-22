const download = require('./download')
const { updateBooksData, checkBook } = require('../helper/book')
const DownloadStatus = require('../lib/downloadStatus')
const downloadStatus = new DownloadStatus()

async function doDownload(book, options = { isNode: false }) {
  const { isNode } = options
  if (!!downloadStatus.checkJob(book.url)) {
    return
  }

  downloadStatus.addJob(book.url, book)
  // 下载book
  return download(book)
    .then(async function(bookData) {
      try {
        // 下载完成之后更新数据
        // await updateBooksData(bookData)
        downloadStatus.changeJob(book.url) // 更改job状态
        return bookData
      } catch (err) {
        console.log(err)
        return false
      }
    })
}

function addJob(url, data) {
  downloadStatus.addJob(url, data)
}

function checkStatus(key) {
  // 检查下载进度
  return downloadStatus.checkJob(key)
}

function clearDownloadJob(key) {
  // 清除下载任务
  const book = downloadStatus.removeJob(key)
  return book
}

module.exports = {
  doDownload,
  checkStatus,
  clearDownloadJob,
}
