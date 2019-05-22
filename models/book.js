const BookModel = require('./schema/bookSchema')

const addBook = (book) => {
  return new Promise((resolve, reject) => {
    const bookDoc = new BookModel(book)
    bookDoc.save((err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

const deleteBook = (params = null) => {
  return new Promise((resolve, reject) => {
    BookModel
      .updateOne(
        params,
        {$set: { public: -1 }},
      )
      .exec((err, result) => {
        if (err) return reject(err)
        resolve({
          ok: true,
        })
      })
  })
}

const updateBooks = (data = []) => {
  return new Promise((resolve, reject) => {
    const list = data.map((book) => updateOneBook(book))
    Promise.all(list)
      .then((result) => {
        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// update or create book
const updateOneBook = (book) => {
  return new Promise((resolve, reject) => {
    const { url, name } = book
    const params = {
      url,
    }

    if (!book) return reject('this data is null')

    BookModel
      .findOne(params)
      .exec(function (err, result) {
        if (err) reject(err)
        if (!result) {
          addBook(book)
            .then((addResult) => {
              resolve({
                node: addResult,
                msg: `更新成功: ${name}`,
              })
            })
        } else {
          BookModel
            .update(params, {$set : book})
            .exec((err, updateResult) => {
              if (err) return reject(err)
              resolve({
                node: updateResult,
                msg: `更新成功: ${name}`,
              })
            })
        }
      })
  })
}

const justUpdateBooks = (data = []) => {
  return new Promise((resolve, reject) => {
    const list = data.map((book) => justUpdateBook(book))
    Promise.all(list)
      .then((result) => {
        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// update book
const justUpdateBook = (book) => {
  return new Promise((resolve, reject) => {
    const {  url } = book
    BookModel
      .updateOne(
        {
          url, // 根据唯一的url
        },
        {$set : book},
        {
          new: true, // 返回修改之后的数据，
        },
      )
      .exec((err, updateResult) => {
        if (err) return reject(err)
        if (updateResult) {
          resolve({
            ok: true,
            node: updateResult,
          })
        } else {
          resolve({
            ok: false,
            msg: '未找到此文档',
          })
        }
        
      })
  })
}


const getAllBooks = (opts = {}) => {
  return new Promise((resolve, reject) => {
    const query = {
      status: 1,
    }
    BookModel
      .find(query, opts.filed || false)
      .exec((err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
  })
}

const getBook = (book) => {
  const { url } = book
  const queryParams = {
    url,
  }
  return new Promise((resolve, reject) => {
    BookModel
        .findOne(queryParams)
        .exec((err, results) => {
          if (err) return resolve(null)
          resolve(results)
        })
  })
}


module.exports = {
  addBook,
  getBook,
  updateOneBook,
  justUpdateBook,
  getAllBooks,
  deleteBook,
  updateBooks,
  justUpdateBooks,
}