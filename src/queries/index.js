const { ordersByStatus } = require('./OrdersByStatus');
const { findImage } = require('./FindImage');

const queries = [
    ordersByStatus,
    findImage
];


module.exports = queries;