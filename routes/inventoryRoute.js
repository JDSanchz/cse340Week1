const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");
const insertValidate = require('../utilities/insert-validation');

// Management view route
router.get("/", utilities.checkLogin,utilities.checkAdminOrEmployee,utilities.handleErrors(invController.renderManagementView));

// Add Classification view route
router.get("/add-classification", utilities.handleErrors(invController.renderClassificationView));

// Add Classification view route
router.get("/add-inventory", utilities.handleErrors(invController.renderMoreInventoryView));

// New route to get inventory based on classification_id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Add route for editing inventory
router.get("/edit/:inv_id", utilities.handleErrors(invController.renderEditInventoryView));

// GET route to deliver the delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.renderDeleteConfirmationView));

router.post(
  "/delete/",
  utilities.handleErrors(invController.DeleteInventory));

router.post(
  "/update/", 
  insertValidate.EditInvRules(),
  insertValidate.EditInventoryP,
  utilities.handleErrors(invController.updateInventory));

router.post(
    "/add-classification",
    insertValidate.classificationRules(),
    insertValidate.checkClass,
    utilities.handleErrors(invController.classInsertion)
  );

router.post(
    "/add-inventory",
    insertValidate.newInvRules(),
    insertValidate.checkInventoryP,
    utilities.handleErrors(invController.invInsertion)
  );

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Example route for inventory item detail view
router.get("/detail/:id", utilities.handleErrors(invController.getInventoryItemDetail));

module.exports = router;
