/* 每天定时跑脚本，更新books */
const schedule = require('node-schedule');
const { getAllBooks, justUpdateBooks } = require('../models/book')
const download = require('../lib/download')

process.on('exit', (code) => {
  cancelJob()
})
process.on('SIGINT', () => {
  cancelJob()
})

async function fetchBooks() {
  const allBooks = await getAllBooks({
    filed: 'url bName baseUrl currentPage',
  })
  const bookList = allBooks.map(book => {
    const { url, baseUrl, bName, currentPage } = book
    const _book = {
      url,
      baseUrl,
      bName,
      currentPage,
    }
    return download(_book, {
      parallelNum: 30, // 并行数
    })
  })

  return Promise.all(bookList).then(function (data) {
    const newData = data.filter(item => item.isUpdate)
    newData.length && justUpdateBooks(newData)
  })
}

var jobRule = new schedule.RecurrenceRule()
jobRule.hour = 0
jobRule.minute = 19

const job = schedule.scheduleJob(jobRule, () => {
  init()
})

function cancelJob() {
  job && job.cancel()
}

async function init() {
  try {
    await fetchBooks()
    console.log("books 更新完毕")
  } catch (err) {
    console.log('更新失败')
    console.log(err)
    process.exit(1)
  }
}



