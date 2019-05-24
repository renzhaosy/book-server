const path = require('path')
const fs = require('fs')
const express = require('express')
const router = express.Router()
/* helper */
const { formatJson } = require('../helper/rendFormat')

/* module */
const search = require('../lib/search')
const { deleteBook } = require('../models/book')

/* lib */
const { download, checkStatus, clearDownloadJob } = require('../lib/book')


router.get('/search', async function(req, res) {
  try {
    const { query } = req.query
    const result = await search(query)
    res.status(200).json(formatJson(result))
  } catch (error) {
    res.status(502).json(formatJson(error, true))
    throw error
  }
})

router.post('/export', async function(req, res) {
  try {
    console.log('in export')
    console.log(req.body)
    const book = await download(req.body)
    const reuslt = book ? book : 'start'
    console.log('after download +++')
    console.log(reuslt)
    res.status(200).json(formatJson(reuslt))
  } catch (error) {
    res.status(502).json(formatJson(error, true))
    throw error
  }
})

router.get('/checkExport', async function(req, res) {
  try {
    const { url } = req.query
    const result = checkStatus(url)
    if (result) {
      res.status(200).json(formatJson('retry'))
    } else {
      const data = clearDownloadJob(url)
      res.status(200).json(formatJson(data))
    }
  } catch (error) {
    res.status(502).json(formatJson(error, true))
    throw error
  }
})

router.get('/download', async function(req, res) {
  try {
    const { name } = req.query
    const filePath = path.resolve(`../books/${name}.txt`)
    var stat = fs.statSync(filePath)
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${encodeURI(name)}.txt`,
      "Content-Length": stat.size
    });
    
    var readStream = fs.createReadStream(filePath)//得到文件输入流

    readStream.setEncoding('utf8');//显示为字符串
    readStream.pipe(res);
  } catch (error) {
    res.status(502).json(formatJson(error, true))
    throw error
  }
})


router.get('/delete', async function(req, res) {
  try {
    let result = {
      ok: false,
    }
    if (req.query) {
      result = await deleteBook(req.query)
    }
    res.status(200).json(formatJson(result))
  } catch (error) {
    res.status(502).json(formatJson(error, true))
    throw error
  }
})

router.get('/|/list', async function(req, res) {
  try {
    // const { query } = req.query
    // const result = await search(query)
    const list = [{
      "bid": 1003306811,
      "bName": "放开那个女巫",
      "bAuth": "二目",
      "desc": "程岩原以为穿越到了欧洲中世纪，成为了一位光荣的王子。但这世界似乎跟自己想的不太一样？女巫真实存在，而且还真具有魔力？女巫种田文，将种田进行到底。",
      "cat": "奇幻",
      "catId": 1,
      "cnt": "333.22万",
      updateTime: '2019-04-19',
      lastPageName: '最新的一章',
      lastPage: 123,
      image: 'https://bookcover.yuewen.com/qdbimg/349573/1003306811/150',
    },
    {
      "bid": 1013293257,
      "bName": "舌尖上的霍格沃茨",
      "bAuth": "幽萌之羽",
      "desc": "艾琳娜·卡斯兰娜，混血媚娃，危险等级：【极度致命】她消弭了千年来学院间的纷争，让霍格沃茨成为圣地。她挽救了无数濒危的神奇动物，增进人与自然的了解。她促使了魔法与非魔法的融合，找到两",
      "cat": "奇幻",
      "catId": 1,
      "cnt": "65.64万",
      "rankCnt": "4718月票",
      image: "https://bookcover.yuewen.com/qdbimg/349573/1013293257/150"
    }]
    res.status(200).json(formatJson(list))
  } catch (error) {
    res.status(502).json(formatJson(error, true))
    throw error
  }
})




module.exports = router