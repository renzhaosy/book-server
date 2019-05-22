const cheerio = require('cheerio')
const rp = require('request-promise')
const iconv = require('iconv-lite')
const chalk = require('chalk')

const searchUrl = `https://so.88dush.com/search/so.php?search_field=0&q=`

async function search(query) {
  const queryString = encodeURIComponent(query)
  const option = {
    url: `${searchUrl}${queryString}`,
    encoding: null,
    transform: function(body) {
      return iconv.decode(body, 'utf8')
    },
    timeout: 20000
  }

  try {
    const bodyHtml = await rp(option)
    const $ = cheerio.load(bodyHtml, {
      decodeEntities: false
    })
    // 搜索没有结果
    const noDataDom = $('.ops_cover .ops_no')
    if (noDataDom.length) {
      return []
    }
    const listDom = $('.ops_cover .block')
    const list = []
    listDom.each(function(item) {
      const _this = $(this)
      const url = _this.find('.block_img a').attr('href').trim()
      const image = _this.find('.block_img a img').attr('src')
      const name = _this.find('.block_txt h2 a').text().trim()
      const infoDomList = _this.find('.block_txt p')
      const desc = infoDomList.eq(infoDomList.length - 1).text().trim().slice(0, 200)
      const author = infoDomList.eq(infoDomList.length - 3).text().trim().replace(/作者：/, '')
      list.push({
        bAuth: author,
        desc,
        url,
        bName: name,
        name,
        image,
        baseUrl: url,
        currentPage: 0,
      })
    })
    return list
  } catch (err) {
    console.log(chalk.red('搜索失败！！！'))
    console.log(err)
  }
}

module.exports = search
