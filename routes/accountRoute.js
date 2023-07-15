const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities/index');
const regValidate = require('../utilities/account-validation');


router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.manageAccount));
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get('/logout', utilities.handleErrors(accountController.handleLogout));
router.get('/update/:account_id', utilities.handleErrors(accountController.buildAccountUpdate));
// Process the registration data
router.post(
    '/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  );

// Process Update account
router.post(
    "/update",
    regValidate.updateAccountRules(),
    regValidate.checkUpdatedData,
    utilities.handleErrors(accountController.accountUpdate)
  );

// Process Update Pass
router.post(
  "/update-password",
  regValidate.updatePassRules(),
  regValidate.checkUpdatedPassData,
  utilities.handleErrors(accountController.accountUpdatePass)
);


router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);


module.exports = router;
