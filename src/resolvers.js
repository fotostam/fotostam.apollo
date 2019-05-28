const {ordersByStatus, findImage} = require('./queries');
const {newOrder} = require('./subscriptions');

const nodeResolver = {
  Node: {
    __resolveType() {
      return null;
    }
  }
};

const resolvers = [
    ordersByStatus,
    findImage,
    newOrder,
    nodeResolver
];

module.exports = {
  resolvers,
};