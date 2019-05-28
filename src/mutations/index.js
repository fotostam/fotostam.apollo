const { createOrder } = require('./CreateOrder');
const { printOrder } = require('./PrintOrder');

const mutations = [
    createOrder,
    printOrder
];

module.exports = mutations;