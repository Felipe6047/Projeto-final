import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { setupSwagger } from "./swagger/setup";

const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);
app.use("/api", routes);
app.use(errorHandler);

export default app;
