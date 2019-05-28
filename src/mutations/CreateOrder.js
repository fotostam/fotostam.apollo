const { gql} = require("apollo-server");
const {NEW_ORDER} = require("../subscriptions/NewOrder");
const {thumbor} = require("../service/thumbor");

const ORDER_SUBSCRIPTION_FIELDS = gql`{
    id
    createdAt
    updatedAt
    name
    group
    status
    error
    photos {
      id
      tag
      amount
      status
      error
      url
    }
  }`

const createOrder = {
  Mutation: {
    createOrder: async (_, args, context, info) => {
      const order = await context.prisma.mutation.createOrder(
        {
          data: {
            name: args.order.name,
            group: args.order.group,
            subtype: args.order.subtype,
            camp: args.order.camp,
            email: args.order.email,
            status: args.order.status,
            groupphoto: args.order.groupphoto,
            print: args.order.print,
            digital: args.order.digital,
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

        console.log(order);

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
            
      return order;
    }
}
}

module.exports = {
    createOrder,
}