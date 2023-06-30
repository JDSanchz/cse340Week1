const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Example route for inventory item detail view
router.get("/detail/:id", utilities.handleErrors(invController.getInventoryItemDetail));

module.exports = router;
