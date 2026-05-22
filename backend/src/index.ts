import app from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

async function bootstrap() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL conectado");
  } catch (err) {
    console.error("Falha ao conectar no MySQL. Verifique o .env e se o banco foi criado.");
    console.error(err);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`FRIK API: http://localhost:${env.port}/api`);
    console.log(`Swagger UI: http://localhost:${env.port}/api/docs`);
  });
}

bootstrap();
