import "reflect-metadata";
import app from "./app";
import { env } from "./config/env";
import { AppDataSource, initializeDatabase } from "./config/database";
import { runSeed } from "./database/seed";

async function bootstrap() {
  try {
    await initializeDatabase();
    console.log("MySQL conectado (TypeORM)");
    // Run migrations
    await AppDataSource.runMigrations();
    console.log("Migrations aplicadas.");
    // Run seed
    await runSeed(AppDataSource);
    console.log("Seed concluído.");
  } catch (err) {
    console.error("\n[FRIK] Falha ao inicializar o banco de dados.\n");
    console.error(err);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Página inicial: http://localhost:${env.port}/`);
    console.log(`FRIK API:       http://localhost:${env.port}/api`);
    console.log(`Swagger UI:     http://localhost:${env.port}/api/docs`);
  });
}

bootstrap();
