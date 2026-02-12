function sort(array, sortBy, order) {
    return array.sort((a, b) => {
        if (!a[sortBy] || !b[sortBy]) return 0;
        if (order === 'desc'){
         return a[sortBy] < b[sortBy] ? 1 : -1;
        }
        return a[sortBy] > b[sortBy] ? 1 : -1;
    });
}
module.exports = sort;
