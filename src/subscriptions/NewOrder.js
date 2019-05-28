const newOrder = {
    Subscription: {
        newOrder: {
            subscribe: (_, __, {prisma}) => pubsub.asyncIterator(NEW_ORDER)
        }
    },
  };

  module.exports = {
    newOrder,
  }