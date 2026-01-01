
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const session = require("express-session");

const MongoDBStore = require("connect-mongodb-session")(session);

const { hostRouter } = require("./routers/hostRouter");
const { authRouter } = require("./routers/authRouter");
const storeRouter = require("./routers/storeRouter");

const rootDir = require("./util/path-util");
const errorController = require("./controllers/errorController");

const MONGO_DB_URL =
  "mongodb+srv://pranaypraveen1210:a4b3c2d1%3F%3F@airbnb.ngu7mqb.mongodb.net/Airbnb?appName=airbnb";

const app = express();

const sessionStore = new MongoDBStore({
  uri: MONGO_DB_URL,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(rootDir, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);
app.use(authRouter);

app.use(storeRouter);


app.use("/host", (req, res, next) => {
  if (req.session.isLoggedIn) {
    return next();
  }
  return res.redirect("/login");
});

app.use("/host", hostRouter);

app.use(errorController.get404);

const PORT = 3002;

mongoose
  .connect(MONGO_DB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));
