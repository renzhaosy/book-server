const ArticleModel = require('./schema/articleSchema')

const { pagination } = require('../helpers/pagination')

// const art = {
//   title: 'test article 这是测试文章', // 文章名称
//   description: 'test article 这是测试文章', // 文章简介
//   content: 'test article 这是测试文章', // 文章内容
//   author: 'joiner', // 作者
//   show: true, // 文章是否展示
//   meta: {
//     votes: 12, // 访问人数
//   },
// }

const addArticle = (article) => {
  return new Promise((resolve, reject) => {
    const articleDoc = new ArticleModel(article)
    articleDoc.save((err, res) => {
      if (err) throw err
      resolve(res)
    })
  })
}

const deleteArticle = ({key}) => {

  return new Promise((resolve, reject) => {
    ArticleModel
        .deleteOne({
          key,
        })
        .exec((err, results) => {
          if (err) reject(err)
          resolve(results)
        })

  })
}

const updateArticle = (data = [], isPublish) => {
  return new Promise((resolve, reject) => {
    const list = data.map((art) => updateOneArticle(art, isPublish))
    Promise.all(list)
      .then((result) => {
        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const updateOneArticle = (art, isPublish) => {
  return new Promise((resolve, reject) => {
    const { title, key } = art
    const params = {}
    if (key) {
      params.key = key
    } else {
      params.title = title
    }
    if (!art) reject('this data is null')

    ArticleModel
      .findOne(params)
      .exec(function (err, result) {
        if (err) reject(err)
        if (!result) {
          addArticle(art)
            .then((addResult) => {
              resolve({
                node: addResult,
                msg: `更新成功: ${title}`,
              })
            })
        } else {
          ArticleModel
            .update(params, art)
            .exec((err, updateResult) => {
              if (err) reject(err)
              resolve({
                node: updateResult,
                msg: `更新成功: ${title}`,
              })
            })
        }
      })
  })
}

const justUpdateArticle = (art, opts) => {
  return new Promise((resolve, reject) => {
    const {  key } = art
    ArticleModel
      .findOneAndUpdate(
        {
          key,
        },
        opts,
      )
      .exec((err, updateResult) => {
        if (err) reject(err)
        console.log(updateResult)
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

const getArticles = ({ page = 1, perPage = 10, ...options }) => {

  return new Promise((resolve, reject) => {
    if (isNaN(Number(perPage)) || isNaN(Number(page))) {
      reject('perPage and page must be numeric.')
    }
    const baseQuery = {
      status: 1,
      publish: true,
    }
    const startNum = page > 1 ? page * perPage : 0 
    ArticleModel.estimatedDocumentCount( baseQuery, (err, total) => {
      if (err) reject(err)
      const pagep = pagination({
        page,
        perPage,
        total,
      })

      ArticleModel
        .find(baseQuery)
        .skip(startNum)
        .sort({articleId: 1})
        .limit(Number(perPage))
        .exec((err, results) => {
          if (err) reject(err)
          resolve(results)
        })
    })
  })
}

const getArticle = (query) => {
  const { articleId, title } = query
  const queryParams = {
    status: 1,
    publish: true,
  }
  if (articleId) {
    queryParams.articleId = Number(articleId)
  }
  if (title) {
    queryParams.title = title
  }
  return new Promise((resolve, reject) => {
      ArticleModel
        .findOne(queryParams)
        .exec((err, results) => {
          if (err) reject(err)
          resolve(results)
        })
  })
}

// const arrr = 

// 添加文章
// addArticle()

// 查询
// getArticles()

module.exports = {
  addArticle,
  updateArticle,
  updateOneArticle,
  getArticles,
  getArticle,
  justUpdateArticle,
  deleteArticle,
}