const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model")
const insertValidate = {};
const utilities = require(".")

insertValidate.classificationRules = () => {
    return [
      body("classification_name")
        .trim()
        .notEmpty()
        .withMessage("Classification name is required.")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("Classification name can only contain alphanumeric characters.")
        .custom(async (classification_name) => {
          const classificationExists = await invModel.checkExistingClassification(classification_name);
          if (classificationExists) {
            throw new Error("Classification already exists.");
          }
        }),
    ];
  };
  

insertValidate.checkClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      nav,
      classification_name: req.body.classification_name,
      title: "Add Classification",
    });
    return;
  }
  next();
};

insertValidate.newInvRules = () => {
    return [
      // Add validation rules for each input field in the form
      body("inv_make")
        .trim()
        .notEmpty()
        .withMessage("Make is required."),
        
      body("inv_model")
        .trim()
        .notEmpty()
        .withMessage("Model is required."),
        
      body("inv_year")
        .trim()
        .notEmpty()
        .withMessage("Year is required.")
        .isNumeric()
        .withMessage("Year must be a number."),
        
      body("inv_description")
        .trim()
        .notEmpty()
        .withMessage("Description is required."),
        
      body("inv_classification")
        .trim()
        .notEmpty()
        .withMessage("Classification is required."),
        
      body("inv_image")
        .trim()
        .notEmpty()
        .withMessage("Image Path is required."),
        
      body("inv_thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Thumbnail Path is required."),
        
      body("inv_price")
        .trim()
        .notEmpty()
        .withMessage("Price is required.")
        .isNumeric()
        .withMessage("Price must be a number."),
        
      body("inv_miles")
        .trim()
        .notEmpty()
        .withMessage("Miles is required.")
        .isNumeric()
        .withMessage("Miles must be a number."),
        
      body("inv_color")
        .trim()
        .notEmpty()
        .withMessage("Color is required.")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Color can only contain letters and spaces."),
    ];
  };
  
  insertValidate.checkInventoryP = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: errors.array(),
      });
      return;
    }
    next();
  };

module.exports = insertValidate;
