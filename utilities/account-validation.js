const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
// valid email is required and cannot already exist in the database
body("account_email")
  .trim()
  .isEmail()
  .normalizeEmail() // refer to validator.js docs
  .withMessage("A valid email is required.")
  .custom(async (account_email) => {
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
      throw new Error("Email exists. Please log in or use different email")
    }
  }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

  /*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    return [
      // valid email is required
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
  
      // password is required
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required."),
    ]
  }

  /*  **********************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("account/login", {
        errors,
        title: "Login",
      })
      return
    }
    next()
  }

  validate.updateAccountRules = () => {
    return [
      // First name is required
      body("firstname")
        .trim()
        .notEmpty()
        .withMessage("First name is required."),
  
      // Last name is required
      body("lastname")
        .trim()
        .notEmpty()
        .withMessage("Last name is required."),
  
      // Valid email is required
      body("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
    ];
  };
  
  validate.checkUpdatedData = async (req, res, next) => {
    let errors = validationResult(req)
    let nav = await utilities.getNav()
    const accountId = req.body.accountId;
    const accountData = await accountModel.getAccountById(accountId);
    if (!errors.isEmpty()) {
      res.render("account/update-view", {
        errors,
        nav,
        title: "Account Update",
        accountData,
      });
      return;
    }
    next();
  };

  validate.updatePassRules = () => {
    return [
      // New password is required, must be at least 8 characters long, 
      // and must contain at least one lowercase letter, one uppercase letter and one number
      body("newPassword")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long.")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
        .withMessage("Password must contain at least one lowercase letter, one uppercase letter and one number.")
    ];
  };
  validate.checkUpdatedPassData = async (req, res, next) => {
    let errors = validationResult(req)
    let nav = await utilities.getNav()
    const accountId = req.body.accountId;
    const accountData = await accountModel.getAccountById(accountId);
    if (!errors.isEmpty()) {
      res.render("account/update-view", {
        errors,
        nav,
        title: "Account Update",
        accountData,
      });
      return;
    }
    next();
  };
    
  
  
  module.exports = validate