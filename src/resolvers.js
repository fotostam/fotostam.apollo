const {ordersByStatus, findImage} = require('./queries');
const {newOrder} = require('./subscriptions');
const {createOrder} = require('./mutations');

const nodeResolver = {
  Node: {
    __resolveType() {
      return null;
    }
  }
};

const resolvers = [
    //Queries
    ordersByStatus,
    findImage,
    //Mutations
    createOrder,
    //Subscriptions
    newOrder,
    //Nodes
    nodeResolver,
];

module.exports = {
  resolvers,
};