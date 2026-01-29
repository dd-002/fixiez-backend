import express from "express";
import connectDB from "./src/configs/db.js"; //connects to database
import routes from "./src/routes/index.js"; //connects to routes
import dotenv from "dotenv";
const app = express();


const port = process.env.PORT || 8000;
//basic middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//routing
app.use("/apiV1", routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

await connectDB(process.env.MONGO_URI);
