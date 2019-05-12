require("dotenv").config();
const { ApolloServer, gql, PubSub} = require("apollo-server");
const { importSchema } = require("graphql-import");
const { Prisma } = require("prisma-binding");
const path = require("path");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://localhost:9200"
});
const fs = require("fs");
const Thumbor = require("thumbor");

const bucketdir = "/data/bucket/";
const printdir = "/data/print/";

const thumbor = new Thumbor("", "http://localhost:8169");
const NEW_ORDER = 'NEW_ORDER';

const resolvers = {
  Query: {
    ordersByStatus: (_, args, context, info) => {
      return context.prisma.query
        .orders(
          {
            where: {
              status: args.status
            }
          },
          info
        )
        .then(x => {
          return x.map(i => {
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
          });
        });
    },
    findImage: async (_, args, context, info) => {
      let result = await client.search({
        index: "fotoindex",
        body: {
          query: {
            wildcard: {
              filename: "*" + args.tag + "*"
            }
          }
        }
      });

      return result.body.hits.hits.map(x => {
        let result = x._source;
        if (result.filename) {
          result.url = thumbor
            .setImagePath(result.filename)
            .resize(150, 150)
            .buildUrl();
        }
        return result;
      });
    }
  },
  Mutation: {
    createOrder: (_, args, context, info) => {
      const order = context.prisma.mutation.createOrder(
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
      ).then(x => {
        console.log(x);
        return x;
      });

      context.pubsub.publish(NEW_ORDER, {
        newOrder: order
      });

      return order;
    },
    printOrder: async (_, args, context, info) => {
      //Get order

      console.log(args.id);
      let photos = await context.prisma.query.photos(
        {
          where: {
            order: {
              id: args.id
            }
          }
        },
        gql`
          {
            id
            tag
            amount
            order {
              id
            }
          }
        `
      );

      let success = true;

      //Copy the files
      for (let photo of photos) {
        let path = bucketdir + photo.tag;
        if (fs.existsSync(path)) {
          for (var i = 0; i < photo.amount; i++) {
            fs.copyFileSync(
              path,
              printdir + photo.order.id + " - " + i + "-" + photo.tag,
              err => {
                if (err) {
                  success = false;
                  context.prisma.mutation.updatePhoto({
                    data: {
                      status: "ERROR",
                      error: "Image could not be copied"
                    },
                    where: {
                      id: photo.id
                    }
                  });
                }
              }
            );
          }
        } else {
          context.prisma.mutation.updatePhoto({
            data: {
              status: "ERROR",
              error: "Image could not be found"
            },
            where: {
              id: photo.id
            }
          });
          success = false;
        }
      }

      if (success) {
        return context.prisma.mutation.updateOrder(
          {
            data: {
              status: "DONE",
              error: ""
            },
            where: {
              id: args.id
            }
          },
          info
        );
      } else {
        return context.prisma.mutation.updateOrder(
          {
            data: {
              status: "ERROR",
              error: "Something is wrong in this order"
            },
            where: {
              id: args.id
            }
          },
          info
        );
      }
    }
  },
  Subscription: {
    newOrder: {
      subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(NEW_ORDER)
    }
  },
  Node: {
    __resolveType() {
      return null;
    }
  }
};

const typeDefs = importSchema(path.resolve("src/schema.graphql"));

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: "src/generated/prisma.graphql",
      endpoint: process.env.PRISMA_URL
    }),
    pubsub
  })
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
