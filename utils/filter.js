function filter(array, key, value) {
    if (!key || !value) return array;
    return array.filter(item => item[key] == value);
}
module.exports = filter;
