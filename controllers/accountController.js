const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs")

async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  }

  async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  }

  async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
  
    // Hash the password before storing
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
      req.flash("notice", "Sorry, there was an error processing the registration.");
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }
    
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }
  }
  

  async function loginAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
  
    // Add server-side validation logic here if needed
  
    // Check if the email and password match an existing account in the database
    const loginResult = await accountModel.loginAccount(account_email, account_password);
  
    if (loginResult) {
      // Login successful
      req.flash("notice", "Login successful!");
      res.status(200).render("account/login", {
        title: "Login",
        nav,
        errors:null
      });
    } else {
      // Login failed
      req.flash("notice", "Invalid email or password.");
      res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      });
    }
  }
  
  
  module.exports = { buildLogin, buildRegister,registerAccount,loginAccount };
  
  