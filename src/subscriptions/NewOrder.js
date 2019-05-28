const NEW_ORDER = 'NEW_ORDER';

const newOrder = {
    Subscription: {
        newOrder: {
            subscribe: (_, __, {prisma}) => pubsub.asyncIterator(NEW_ORDER)
        }
    },
  };

  module.exports = {
    newOrder,
    NEW_ORDER
  }