const fs = require('fs')
const path = require('path')

const booksConfigPath = path.resolve(__dirname, '../books/books.json')

function readFile(path) {
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
    const booksData = await readFile(booksConfigPath)
    const { books } = JSON.parse(booksData)
    return books || []
  } catch (err) {
    console.log('read books list fail', err)
    return []
  }
}

async function updateBooksData(data) {
  try {
    const booksData = await getBooksData()
    const index = booksData.findIndex(book => book.url === data.url)
    let newBooksData
    if (index > -1) {
      newBooksData = booksData.map( book => book.url === data.url ? Object.assign({}, book, data) : book)
    } else {
      newBooksData = [...booksData, data]
    }
    await writeFile(booksConfigPath, JSON.stringify({
      books: newBooksData
    }))
  } catch (err) {
    console.log(err)
  }
}

async function checkBook(data) {
  try {
    const booksData = await getBooksData()
    return booksData.find(book => book.url === data.url)
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  readFile,
  writeFile,
  getBooksData,
  updateBooksData,
  checkBook,
}