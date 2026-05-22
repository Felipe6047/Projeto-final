import app from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

async function bootstrap() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL conectado");
  } catch (err) {
    console.error("\n[FRIK] Falha ao conectar no MySQL.\n");
    console.error("1. Crie/edite o arquivo backend/.env (copie de .env.example)");
    console.error("2. Defina DB_PASSWORD com a senha do seu MySQL (Workbench)");
    console.error("3. Execute database/schema.sql e database/seed.sql no MySQL\n");
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
