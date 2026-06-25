import "reflect-metadata";
import { AppDataSource } from "../config/data-source";

async function runMigrations() {
  await AppDataSource.initialize();
  const executed = await AppDataSource.runMigrations();
  if (executed.length === 0) {
    console.log("Nenhuma migration pendente.");
  } else {
    console.log(
      "Migrations executadas:",
      executed.map((m) => m.name).join(", ")
    );
  }
  await AppDataSource.destroy();
}

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
