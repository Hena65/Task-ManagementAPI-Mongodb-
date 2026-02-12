function paginate(array, page = 1, limit = 5) {
    const start = (page - 1) * limit;
    const end = page * limit;
    return array.slice(start, end);
}
module.exports = paginate;
