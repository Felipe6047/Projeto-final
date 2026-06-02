import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { entities } from "../entities";
import { InitialSchema1748265600000 } from "../database/migrations/1748265600000-InitialSchema";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.database,
  entities,
  migrations: [InitialSchema1748265600000],
  synchronize: false,
  logging: env.nodeEnv === "development",
});
