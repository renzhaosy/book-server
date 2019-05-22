const pagination = ({ page = 1, perPage = 10, total = 0 }) => {
  return {
    page,
    perPage,
    from: (page - 1) * perPage,
    to: page * perPage  - 1,
    total: total,
    count: Math.ceil(total / perPage)
  }
}

module.exports = {
  pagination,
}