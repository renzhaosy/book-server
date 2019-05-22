const { updateBooks, getAllBooks } = require('../models/book')
const download = require('../lib/download')
const { books }  = require('./initBooksData.json')

async function initJson() {
  const books = await getAllBooks()
  const _books = books.map((book) => {
    const { desc, bName, bAuth, image, url, baseUrl,  } = book
    return {
      desc,
      bName,
      bAuth,
      image,
      url,
      baseUrl,
    }
  })
  console.log(JSON.stringify(_books))
}

async function fetchBooks() {
  if (!books) throw Error('No Books Data!!!')
  const bookList = books.map(book => download(book))
  return Promise.all(bookList).then(function (data) {
    return updateBooks(data)
  })
}


async function init() {
  try {
    await fetchBooks()
  } catch (error) {
    console.log(error)
  }
  process.exit(0)
}
init()