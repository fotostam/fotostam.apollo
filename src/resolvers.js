const queries = require('./queries');
const subscriptions = require('./subscriptions');
const mutations = require('./mutations');

const nodeResolver = {
  Node: {
    __resolveType() {
      return null;
    }
  }
};

var resolvers = [
  nodeResolver
];

resolvers = resolvers.concat(queries);
resolvers = resolvers.concat(mutations);
resolvers = resolvers.concat(subscriptions);

module.exports = {
  resolvers,
};