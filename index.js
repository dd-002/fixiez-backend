import express from "express";
import connectDB from "./src/configs/db.js"; //connects to database
import routes from "./src/routes/index.js"; //connects to routes
import passport from "passport"; 
import configurePassport from './src/configs/passport.js'; // 1. Import your function
import { validateSession } from "./src/middlewares/sessionGuard.js";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();


const port = process.env.PORT || 8000;

//basic middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//auth middlewares
app.use(session({
  secret: process.env.SESSION_SECRET, // A strong secret key
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 4 * 7 * 24 * 60 * 60 * 1000 // 4 weeks
  }
}));

configurePassport();
app.use(passport.initialize()); // initialises passport
app.use(passport.session()); //attaches a dynamic property called user to passport
// app.use(validateSession); //

//routing
app.use("/apiV1", routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

await connectDB(process.env.MONGO_URI);
