require("dotenv").config();



const { check, validationResult } = require("express-validator");
const  User  = require("../models/User");
const bcrypt = require("bcryptjs");
const sendGrid = require("@sendgrid/mail");


sendGrid.setApiKey(process.env.SEND_GRID_KEY);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    isLoggedIn: false,
  });
};

exports.getForgotPassword = (req, res, next) => {
  res.render("auth/forgot", {
    pageTitle: "Forgot Password",
    isLoggedIn: false,
  });
};

exports.postForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ email });
    console.log(user);
    res.redirect(`/reset-password?email=${email}`);
  }
  catch (err) {
    res.render("auth/forgot", {
      pageTitle: "Forgot Password",
      isLoggedIn: false,
      errorMessages: [err.message]
    });
  }
}

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    isLoggedIn: false,
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(user, isMatch);
    if (!isMatch) {
      throw new Error("Password does not match");
    }

    req.session.isLoggedIn = true;

    res.redirect("/");

  } catch (err) {
    res.render("auth/login", {
      pageTitle: "Login",
      isLoggedIn: false,
      errorMessages: [err.message]
    });
  }
};

exports.postSignup = [
  check("firstName")
    .notEmpty()
    .withMessage("First name is mandatory")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  check("lastName")
    .trim()
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Last name can only contain letters and spaces"),

  check("email").isEmail().withMessage("Please enter a valid email address"),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*?><=+]/)
    .withMessage("Password must contain at least one special character"),

  check("confirm_password")
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Confirm Password does not match Password");
    }
    return true;
  }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Please select either host or guest"),

  check("terms")
  .notEmpty()
  .withMessage("Please agree to the terms"),

  async (req, res, next) => {
  console.log('User came for signup: ', req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup',
      {
        pageTitle: 'Login',
        isLoggedIn: false,
        errorMessages: errors.array().map(err => err.msg),
        oldInput: req.body,
      }
    );
  }

  const { firstName, lastName, email, password, userType } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      firstName, lastName, email, password: hashedPassword, userType
    });
    await user.save();

    const welcomeEmail = {
      to: email,
      from: "praveenpranay07@gmail.com",
      subject: "Welcome to Our Airbnb !!!",
      html: `<h1> Welcome ${firstName} ${lastName} Please book your first vacation home with us.</h1`
    };

    await sendGrid.send(welcomeEmail);



    return res.redirect("/login");
  } catch (err) {
    return res.status(422).render('auth/signup',
      {
        pageTitle: 'Login',
        isLoggedIn: false,
        errorMessages: [err.message],
        oldInput: req.body,
      }
    );
  }
}
];

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
