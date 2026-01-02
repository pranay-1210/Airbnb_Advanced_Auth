
const { check } = require("express-validator");

exports.firstNameValidation = check("firstName")
    .notEmpty()
    .withMessage("First name is mandatory")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces");

  exports.lastNameValidation = check("lastName")
    .trim()
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Last name can only contain letters and spaces");

  exports.emailValidation = check("email").isEmail().withMessage("Please enter a valid email address");

  exports.passwordValidation = check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*?><=+]/)
    .withMessage("Password must contain at least one special character");

  exports.confirmPasswordValidation = check("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Confirm Password does not match Password");
    }
    return true;
  }),

  exports.userTypeValidation = check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Please select either host or guest");

  exports.termsValidation = check("terms").notEmpty().withMessage("Please agree to the terms");