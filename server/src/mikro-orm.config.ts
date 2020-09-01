import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

const config = {
  dbName: "reddit",
  migrations: {
    path: path.join(__dirname, "..", "src", "migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  user: "postgres",
  password: "postgres",
  type: "postgresql",
  debug: !__prod__,
  entities: [Post],
} as Parameters<typeof MikroORM.init>[0];

export default config;
