

const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");

authRouter.get("/login", authController.getLogin);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/login", authController.postLogin);
authRouter.post("/signup", authController.postSignup);
authRouter.post("/logout", authController.postLogout);
authRouter.get("/forgot-password", authController.getForgotPassword);
authRouter.post("/forgot-password", authController.postForgotPassword);












exports.authRouter = authRouter;