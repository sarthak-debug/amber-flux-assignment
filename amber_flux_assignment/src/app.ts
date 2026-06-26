import express from "express";
import quoteRoutes from "./routes/quoteRoutes";
import { requestId, requestLogger } from "./middleware/requestLogger";

const app = express();

app.use(express.json());
app.use(requestId);
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Backend Assignment Running 🚀");
});

app.use("/quotes", quoteRoutes);

export default app;