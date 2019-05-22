const fs = require('fs')
const path = require('path')

const downLoad = require('./download')
const booksConfigPath = path.resolve(__dirname, '../books/books.json')

function readFileData(path) {
  return new Promise((resolve, reject) => {
    if (!path) reject('no path for read file')
    const readStream = fs.createReadStream(path, {
      encoding: 'utf8'
    })
    readStream.on('error', (err) => {
      console.log('read error', err)
    })
    readStream.on('data', (chunk) => {
      resolve(chunk)
    })
  })
}

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    if (!path) reject('no write file path')
    const writeStream = fs.createWriteStream(path)
    writeStream.write(data)
    writeStream.end();
    writeStream.on('error', (err) => {
      console.log('write error', err)
      reject(false)
    })
    writeStream.on('finish', () => {
      resolve()
    })
  })  
}

async function getBooksData() {
  try {
    const booksData = await readFileData(booksConfigPath)
    const { books } = JSON.parse(booksData)
    return books || []
  } catch (err) {
    console.log('read books list fail', err)
    return []
  }
}

async function init() {
  const booksList = await getBooksData()
  if (!booksList.length) return

  const downLoadList = booksList.map( book => {
    return downLoad(book)
  })

  try {
    const booksData = await Promise.all(downLoadList)
    const data = {
      books: booksData
    }
    await writeFile(booksConfigPath, JSON.stringify(data))
    return true
  } catch (err) {
    console.log('download fail', err)
  }
}

module.exports = init
