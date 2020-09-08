import "reflect-metadata";
import { __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { createConnection } from 'typeorm'
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'reddit',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [Post, User]
  })


  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => console.log("server running"));
};

main();
