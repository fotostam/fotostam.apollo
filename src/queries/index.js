const { orderByStatus } = require('./OrdersByStatus');
const { findImage } = require('./FindImage');

const queries = [
    orderByStatus,
    findImage
];

module.exports = {
  queries,
};