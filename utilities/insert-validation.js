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
        .notEmpty().withMessage("Miles is required.")
        .isInt().withMessage("Miles must be an integer."),
      
      body("inv_color")
        .trim()
        .notEmpty()
        .withMessage("Color is required.")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Color can only contain letters and spaces."),
    ];
  };
  
  insertValidate.checkInventoryP = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      const classifications = await invModel.getClassificationsSelect();
      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classifications,
        errors,
        locals: req.body, // Include req.body as the locals to retain the form values
      });
      return;
    }
    next();
  };
  
  insertValidate.EditInvRules = () => {
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
        
      body("classification_id")
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
        .notEmpty().withMessage("Miles is required.")
        .isInt().withMessage("Miles must be an integer."),
      
      body("inv_color")
        .trim()
        .notEmpty()
        .withMessage("Color is required.")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Color can only contain letters and spaces."),
    ];
  };
  
  insertValidate.EditInventoryP = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const inv_id = req.body.inv_id;
      const inv_idd = parseInt(req.body.inv_id)
      console.log(inv_idd)
      const itemData = await invModel.getVehicleById(inv_idd)
      let nav = await utilities.getNav();
      const classifications = await invModel.getClassificationsSelect();
      res.render("./inventory/edit-inventory", {
        title: "Edit Inventory",
        nav,
        classifications: classifications.map(classification => ({
          ...classification,
          selected: classification.classification_id == itemData.classification_id
        })),
        errors,
        inv_id,
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_year: req.body.inv_year,
        inv_description: req.body.inv_description,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail,
        inv_price: req.body.inv_price,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
        classification_id: req.body.classification_id
      });
      return;
    }
    next();
  };

  // Validation rules for comments
insertValidate.checkCommentRules = () => {
  return [
      body("comment")
          .trim()
          .notEmpty()
          .withMessage("Comment is required 😳")
          .isLength({ max: 30 })
          .withMessage("Comment must not exceed 30 characters 😠"),
  ];
};


insertValidate.commentRules = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, re-render the form with error messages
    let nav = await utilities.getNav();
    const classificationId = req.params.classificationId;
    const title = req.body.title; // Assuming you are passing the title in the form data

    // Fetch comments
    const comments = await invModel.fetchComments(classificationId);

    res.render("inventory/community", { // Replace "community" with your correct path to the form template
      title,
      nav,
      errors,
      classificationId,
      comments,
      comment: req.body.comment
    });
    return;
  }
  next();
};

module.exports = insertValidate;
