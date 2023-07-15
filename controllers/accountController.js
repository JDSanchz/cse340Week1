const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

  async function manageAccount(req, res,next) {
    let nav = await utilities.getNav();
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      account_firstname: res.locals.username,
      accountData: res.locals.accountData
    });
  };

  async function buildAccountUpdate(req, res, next) {
    try {
      let nav = await utilities.getNav();
  
      // Get the updated account data
      const accountId = req.params.account_id;
      const accountData = await accountModel.getAccountById(accountId);
  
      // Pass the updated account data to the view
      res.render("./account/update-view", {
        title: "Update Account Info",
        nav,
        errors: null,
        accountData,  // Pass the updated account data here
      });
  
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
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
  
/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
       // Setting res.locals variables for successful login
       res.locals.isLoggedIn = true;
       res.locals.username = accountData.account_firstname; 
        console.log(res.locals.isLoggedIn)
        console.log(res.locals.username)
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
      return;
    }
  } catch (error) {
    return new Error("Access Forbidden");
  }
}

async function  handleLogout (req,res){
  res.clearCookie('jwt');  // Clear the JWT token cookie
  req.flash('notice', 'You have successfully logged out'); // Optional: Inform the user they have logged out
  res.redirect('/');  // Redirect to home page
};


async function updateSessionAccount(req, accountId) {
  // Query the updated account data from the database
  const updatedAccount = await accountModel.getAccountById(accountId);

  // Log the updated account data
  console.log("Updated account data from database:", updatedAccount);

  // Update the account information in the session
  req.session.accountData = updatedAccount;

  // Manually save the session
  req.session.save(err => {
    if (err) {
      // handle error
      console.log(err);
    } else {
      // Log the updated session data
      console.log("Updated session data:", req.session.accountData);
    }
  });
}


async function accountUpdate(req, res, next) {
  let nav = await utilities.getNav();
  const accountId = req.body.accountId;
  const { firstname, lastname, email } = req.body;

  try {
    // Check if the new email already exists in the database
    const existingAccount = await accountModel.getAccountByEmailUpdate(email);
    console.log('Existing Account ID:', existingAccount.account_id, typeof existingAccount.account_id);
    console.log('Account ID:', accountId, typeof accountId);
    // If an account with the new email exists and it's not the current account, send an error message
// If an account with the new email exists and it's not the current account, send an error message
if (existingAccount && existingAccount.account_id !== Number(accountId)) {
  req.flash('notice', 'The provided email is already in use. Please use a different email.');
  res.status(400).render('account/update-view', {
    title: 'Update Account Info',
    nav,
    errors: null
  });
  return;
}
    // Attempt to update account info in database
    const updateResult = await accountModel.updateAccountInfo(accountId, firstname, lastname, email);

    // If the update was unsuccessful, return to the update view with error message
    if (!updateResult) {
      req.flash('notice', 'Account update failed. Please try again.');
      res.status(400).render('account/update-view', {
        title: 'Update Account Info',
        nav,
        errors: null
      });
      return;
    }

    // Update the account information in the session
    await updateSessionAccount(req, accountId);

    // Set success message
    req.flash('notice', 'Account updated successfully.');

    // Deliver the management view with the updated account information
    res.render('account/account-management', {
      title: 'Account Management',
      nav,
      errors: null,
      account_firstname: req.session.accountData.account_firstname,
      accountData: req.session.accountData
    });

  } catch (error) {
    next(error);  // Pass the error to the error handling middleware
  }
}


async function accountUpdatePass(req, res, next) {
  let nav = await utilities.getNav();
  const accountId = req.body.accountId;
  console.log(accountId);
  const { oldPassword, newPassword } = req.body;
  console.log(req.body); 

  // Fetch the current account data from the database
  const accountData = await accountModel.getAccountById(accountId);

  try {
    // Compare the old password with the current password in the database
    if (!await bcrypt.compare(oldPassword, accountData.account_password)) {
      req.flash('notice', 'Old password is incorrect. Please try again.');
      res.status(400).render('account/update-view', {
        title: 'Update Password',
        nav,
        errors: null
      });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const updateResult = await accountModel.updateAccountPassword(accountId, hashedPassword);

    // If the update was unsuccessful, return to the update password view with error message
    if (!updateResult) {
      req.flash('notice', 'Password update failed. Please try again.');
      res.status(400).render('account/update-view', {
        title: 'Update Password',
        nav,
        errors: null
      });
      return;
    }

    // Set success message
    req.flash('notice', 'Password updated successfully.');

    // Deliver the management view with the updated account information
    res.render('account/account-management', {
      title: 'Account Management',
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      accountData: accountData
    });

  } catch (error) {
    next(error);  // Pass the error to the error handling middleware
  }
}




  
  module.exports = { buildLogin, buildRegister,registerAccount,accountLogin,manageAccount,handleLogout,buildAccountUpdate,accountUpdate, accountUpdatePass };
  
  