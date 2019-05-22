class DownloadStatus {
  constructor(opts) {
    this.opts = opts
    this.jobs = {}
  }

  addJob(key,data) {
    this.jobs[key] = {
      status: true,
      data,
    }
  }

  removeJob(key) {
    let data
    if (this.jobs[key]) {
      data = Object.assign({}, this.jobs[key].data)
      delete this.jobs[key]
    }
    return data
  }

  changeJob(key) {
    this.jobs[key].status = false
  }

  checkJob(key) {
    return !!(this.jobs[key] && this.jobs[key].status)
  }

}

module.exports = DownloadStatus