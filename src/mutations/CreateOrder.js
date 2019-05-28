const createOrder = {
  Mutation: {
    createOrder: async (_, args, context, info) => {
      const order = await context.prisma.mutation.createOrder(
        {
          data: {
            name: args.order.name,
            group: args.order.group,
            status: args.order.status,
            error: args.order.error,
            photos: {
              create: args.order.photos.map(x => {
                let p = x;
                p.status = 'HEALTHY'

                return p;
              })
            }
          }
        },
        info
      );

      context.pubsub.publish(NEW_ORDER, {
        newOrder: await context.prisma.query.order({ where: { id: order.id } }, ORDER_SUBSCRIPTION_FIELDS).then(i => {
            i.photos = i.photos.map(p => {
              if (p.url == null && p.tag) {
                p.url = thumbor
                  .setImagePath(p.tag)
                  .resize(150, 150)
                  .buildUrl();
              }
              return p;
            });

            return i;
        })
      });
    }
}
}

module.exports = {
    createOrder,
}
    