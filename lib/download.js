const path = require('path')
const chalk = require('chalk')
const cheerio = require('cheerio')
const rp = require('request-promise')
const iconv = require('iconv-lite')
const fs = require('fs')
const DOWNLOAD_PATH = '../books'
let errors = []

function fsExistsSync(path) {
  try{
    fs.accessSync(path,fs.F_OK);
  }catch(e){
    return false;
  }
  return true;
}

function writeFile(name, data) {
  return new Promise((resolve, reject) => {
    if (!name) reject('no write file name')
    // 判断文件夹是否存在，未存在则创建
    if (!fsExistsSync(DOWNLOAD_PATH)) {
      console.log(chalk.yellow(`文件夹不存在, 已创建: ${DOWNLOAD_PATH}`))
      fs.mkdirSync(DOWNLOAD_PATH)
    }

    const bookPath = `${DOWNLOAD_PATH}/${name}`

    fs.stat(bookPath, function (err, stats) {
      const length = stats ? stats.size : 0
      const writeStream = fs.createWriteStream(bookPath, {
        flags: length ? 'r+' : 'w', // 当文件存在则为 修改文件模式 而不是 覆盖文件模式
        start: length
      })
      writeStream.write(data + `\n\n`)
      writeStream.end();
      writeStream.on('error', (err) => {
        reject(false)
      })
      writeStream.on('finish', () => {
        resolve(bookPath)
      })
    })
  })
}

async function download(book, opts = {}) {
  try{
    if (!book || !book.url) return false
    let { url, currentPage, bName, baseUrl } = book
    console.log(`start download ${url}`)
    if (!url || !baseUrl) {
      console.warn('book url 不正确！！！')
      return false
    }
    let { bookName, pages, desc } = await getBook(url, baseUrl)
    currentPage = currentPage ? currentPage : 0
    if(pages && pages.length&& bookName){
      // check update
      if ( pages.length <= currentPage ) {
        console.log(`${ bookName } 没有更新`)
        return book
      }
      const newPages  = pages.slice(currentPage - pages.length)
      console.log(`获取《${bookName}》目录，共 ${pages.length} 章，需更新 ${newPages.length} 章，开始下载章节`)
      const allContentList = await downPages(newPages, opts)
      const content = allContentList.join('\n\n')
      const bookPath = await writeFile(`${bName || bookName}.txt`, content)
      console.log(chalk.green(`${bName} 下载完成 共${pages.length}章`))
      return Object.assign({},
        book,
        {
          bName: bName || bookName,
          desc: desc,
          currentPage: pages.length,
          currentPageName: pages[pages.length - 1].name,
          path: bookPath,
          isUpdate: true,
        }
      )
    }
  } catch(err) {
    console.log(err)
    return book
  }
}

async function getBook(url, baseUrl) {
  const option = {
    url,
    encoding: null,
    transform: function(body) {
      return iconv.decode(body, 'gbk')
    }
  }

  try {
    const pageUrls = []
    const bodyHtml = await rp(option)
    const $ = cheerio.load(bodyHtml, {
      decodeEntities: false
    })
    
    // const bookName = $('#maininfo #info h1').html()
    const bookName = $('.rt h1').html()
    // const bookInfoHtml = $('.msg').html()
    const bookDesc = $('.intro').html()
                      .replace(/&nbsp;?/g, '')
                      .replace(/(\n|\r)+/mg, '')
                      .replace(/\s+/g, ' ')
    const pageListDom = $('.mulu ul li a').filter(function() {
      const href = $(this).attr('href').trim()
      return href && !/^javascript|#/.test(href)
    })
    pageListDom.each(function(index) {
      let href = $(this).attr('href').trim()
      if (href.indexOf('http' < 0)) {
        href = `${baseUrl}${href}?v=${Date.now()}`
      }
      const name = $(this).html().trim()
      pageUrls.push({
        url: href,
        name,
        index
      })
    })
    return {
      bookName: bookName,
      desc: bookDesc,
      pages: pageUrls
    }
  } catch(err) {
    console.log(err)
  }
}


function getInfo(html) {

}


async function downPages(pages, opts) {
  const getPageList = pages.map(page => function() {
    return fetchPage(page, opts)
  })
  let pageContents = await mulitTool(getPageList, opts)
  if(errors && errors.length) {
    const errorHtmlList = errors
    let errorPromises = []
    errorHtmlList.forEach(function(errPage) {
      errorPromises.push(function() {
        return fetchPage(errPage, opts)
      })
    })
    errors = []
    const errorContents = await mulitTool(errorPromises, opts)
    errorHtmlList.forEach(function(errorPage, index) {
      pageContents[errorPage.index] = errorContents[index] || ''
    })
  }
  return pageContents
}

async function fetchPage(page, opts) {
  const option = {
    url: page.url,
    encoding: null,
    transform: function(body) {
      return iconv.decode(body, 'gbk')
    },
    timeout: 20000
  }
  
  try {
    const bodyHtml = await rp(option)
    const $ = cheerio.load(bodyHtml, {
      decodeEntities: false
    })
    
    // const pageName = $('.content_read .box_con .bookname h1').html()
    const pageName = $('.novel h1').html()

    const contentHtml = $('.yd_text2').html()
    const contentText = handleContent(contentHtml)
    const _name = `第 ${page.index + 1} 章 ${pageName}`
    const content = `${_name} \n\n${contentText}`
    // console.log(`${_name} 下载完成！`)
    return content
  } catch(err) {
    const message = `${page.name} ${page.url} 下载失败!`
    console.log(message)
    errors.push(page)
    return `第 ${page.index + 1} 章 ${page.name}`
  }
}

async function mulitTool(promiseArr, opts) {
  const options = Object.assign({
    parallelNum: 45,
    timeout: false,
    time: 30000
  }, opts || {})
  let nowSub = 0 //当前进行promise第一个的下角标
  const totalPromise = promiseArr.length
  let result = []
  async function execute() {
    const nextSub = nowSub + options.parallelNum
    const doPromiseArr = promiseArr.slice(nowSub, nextSub)
    let doingPromiseArr = []
    doPromiseArr.forEach(item => {
      doingPromiseArr.push(item())
    })
    const itemResult = await Promise.all(doingPromiseArr)
    result = result.concat(itemResult)
    nowSub = nextSub
    return nextSub <= totalPromise - 1 ? execute() : false
  }
  await execute()
  return result
}

function handleContent(content) {
  return formatFor88(content)
}

function formatFor88(content) {
  // const chSymbol = `\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5`
  // const chinese = `\u4e00-\u9fa5`
  // const en = `a-zA-Z`
  // const num = `0-9`
  const result = content
  .replace(/^\s+/g, '    ')
  .replace(/<br ?\/?>\s+/g, '\n    ')
  .replace(/<br ?\/?>/g, '\n')
  .replace(/&nbsp;?/g, '')
  .replace(/^(\n|\r)+/mg, '')
  .replace(/(\n|\r)+/mg, '\n')

  return result
}

module.exports = download
