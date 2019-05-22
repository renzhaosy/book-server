const formatJson = (data, isError) => {
  return {
    data: isError ? false : data,
    error: isError ? data : {}
  }
}

module.exports = {
  formatJson,
}