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

const typeDefs = importSchema(path.resolve("src/typeDefs/schema.graphql"));

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





//       return order;
//     },
//     printOrder: async (_, args, context, info) => {
//       let photos = await context.prisma.query.photos(
//         {
//           where: {
//             order: {
//               id: args.id
//             }
//           }
//         },
//         gql`
//           {
//             id
//             tag
//             amount
//             order {
//               id
//             }
//           }
//         `
//       );

//       let success = true;

//       //Copy the files
//       for (let photo of photos) {
//         let path = bucketdir + photo.tag;
//         if (fs.existsSync(path)) {
//           for (var i = 0; i < photo.amount; i++) {
//             fs.copyFileSync(
//               path,
//               printdir + photo.order.id + " - " + i + "-" + photo.tag,
//               err => {
//                 if (err) {
//                   success = false;
//                   context.prisma.mutation.updatePhoto({
//                     data: {
//                       status: "ERROR",
//                       error: "Image could not be copied"
//                     },
//                     where: {
//                       id: photo.id
//                     }
//                   });
//                 }
//               }
//             );
//           }
//         } else {
//           context.prisma.mutation.updatePhoto({
//             data: {
//               status: "ERROR",
//               error: "Image could not be found"
//             },
//             where: {
//               id: photo.id
//             }
//           });
//           success = false;
//         }
//       }

//       if (success) {
//         return context.prisma.mutation.updateOrder(
//           {
//             data: {
//               status: "TO_BE_PICKED",
//               error: ""
//             },
//             where: {
//               id: args.id
//             }
//           },
//           info
//         );
//       } else {
//         return context.prisma.mutation.updateOrder(
//           {
//             data: {
//               status: "ERROR",
//               error: "Something is wrong in this order"
//             },
//             where: {
//               id: args.id
//             }
//           },
//           info
//         );
//       }
//     }
//   },

// };

const { resolvers } = require("./resolvers");

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: "src/typeDefs/prisma.graphql",
      endpoint: process.env.PRISMA_URL
    }),
    pubsub
  })
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
