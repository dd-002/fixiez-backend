import express from "express";
import connectDB from "./src/configs/db.js"; //connects to database
import routes from "./src/routes/index.js"; //connects to routes
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

const port = process.env.PORT || 8000;
app.use(cookieParser());
app.use(
  cors({
    origin: `${process.env.FRONTEND_BASE_URL}`,
    credentials: true, // for allowing cookies
  }),
);
//basic middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
dotenv.config();

//routing
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

await connectDB();
