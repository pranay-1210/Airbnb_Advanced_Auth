require("dotenv").config();

const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const session = require("express-session");

const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");

const { hostRouter } = require("./routers/hostRouter");
const { authRouter } = require("./routers/authRouter");
const storeRouter = require("./routers/storeRouter");

const rootDir = require("./util/path-util");
const errorController = require("./controllers/errorController");

const MONGO_DB_URL =
  `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@airbnb.ngu7mqb.mongodb.net/${process.env.MONGO_DB_DATABASE}`;

const app = express();

const sessionStore = new MongoDBStore({
  uri: MONGO_DB_URL,
  collection: "sessions",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
}); 

const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(rootDir, "public")));
app.use('/uploads', express.static(path.join(rootDir, "uploads")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({storage, fileFilter}).single('photo'));

app.use(
  session({
    secret: "helloWorld",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);
app.use(authRouter);

app.use(storeRouter);


app.use("/host", (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");

  }
  next();
  
})

app.use("/host", hostRouter);

app.use(errorController.get404);

const PORT = process.env.PORT || 3002;

mongoose
  .connect(MONGO_DB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));
