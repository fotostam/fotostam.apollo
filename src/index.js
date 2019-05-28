require("dotenv").config();
const { ApolloServer, gql, PubSub} = require("apollo-server");
const { importSchema } = require("graphql-import");
const { Prisma } = require("prisma-binding");
const path = require("path");

const typeDefs = importSchema(path.resolve("src/typeDefs/schema.graphql"));

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
