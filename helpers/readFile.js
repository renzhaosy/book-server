#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const dir = path.resolve(__dirname, '../blogs')

const readFiles =  (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
      const filesListPromise = files.map((fileName) => readFile(path.join(dirPath, fileName)))
      try {
        const filesList = await Promise.all(filesListPromise)
        resolve(filesList)
      } catch (error) {
        throw error
      }
    })
  })
}

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err)
        resolve(data)
    })
  })
}

async function init() {
  const files = await readFiles()
  console.log('files +++')
  console.log(files)
}
// init()

module.exports = {
  readFile,
  readFiles
}