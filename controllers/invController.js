const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.getInventoryItemDetail = async function (req, res, next) {
  const inventoryId = req.params.id;

  try {
    const vehicleData = await invModel.getVehicleById(inventoryId);
    const vehicleHTML = utilities.wrapVehicleDataInHTML(vehicleData);
    const nav = await utilities.getNav();

    res.render('./inventory/detail', { title: 'Vehicle Details', nav: nav, vehicleHTML: vehicleHTML });
  } catch (error) {
    console.error("Error retrieving inventory item detail:", error);
    next({ status: 500, message: "Internal Server Error" });
  }
};

invCont.renderManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await invModel.getClassificationsSelect();

    res.render("inventory/management", {
      title: "Inventory Management",
      nav: nav,
      classificationSelect: classificationSelect,
      errors: null,
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
    next({ status: 500, message: "Internal Server Error" });
  }
};

invCont.renderClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav: nav,
      errors: null,
    });
  } catch (error) {
    console.error("Error rendering add-classification view:", error);
    next({ status: 500, message: "Internal Server Error" });
  }
};

invCont.classInsertion = async function (req, res, next) {
  const { classification_name } = req.body;

  try {
    // Insert the new classification into the database
    await invModel.insertClassification(classification_name);

    // Redirect to the management view with a success flash message
    req.flash("success", "Classification added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error inserting classification:", error);

    req.flash("error", "Failed to insert classification.");
    const nav = await utilities.getNav();
    res.status(401).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      classification_name: req.body.classification_name,
      errors: [{ msg: "Failed to insert classification." }],
    });
  }
};


invCont.renderMoreInventoryView = async function (req, res, next) {
  try {
    const classifications = await invModel.getClassificationsSelect();
    const nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: nav,
      classifications: classifications,
      inv_make: "", // Set the default values to empty strings
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_classification: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      errors: null,
    });
  } catch (error) {
    console.error("Error rendering more inventory view:", error);
    next({ status: 500, message: "Internal Server Error" });
  }
};


invCont.invInsertion = async (req, res, next) => {
  // Extract the inventory data from the request body
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_classification,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  try {
    // Retrieve the classification_id based on the selected classification name
    console.log(inv_classification)

    // Insert the new inventory item into the database
    await invModel.insertInventory({
      make: inv_make,
      model: inv_model,
      year: inv_year,
      description: inv_description,
      classification: inv_classification,
      image: inv_image,
      thumbnail: inv_thumbnail,
      price: inv_price,
      miles: inv_miles,
      color: inv_color,
    });

    // Redirect to the management view with a success flash message
    req.flash("success", "Inventory added successfully.");
    res.redirect("/inv");

  } catch (error) {
    console.error("Error inserting inventory:", error);

    req.flash("error", "Failed to insert inventory.");
    const nav = await utilities.getNav();
    res.status(401).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classification_name: req.body.classification_name,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.renderEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    console.log(inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    const classifications = await invModel.getClassificationsSelect()
    console.log(itemData)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classifications: classifications.map(classification => ({
        ...classification,
        selected: classification.classification_id == itemData.classification_id
      })),
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
    console.log(itemData.classification_id)
  } catch (error) {
    console.error("Error rendering edit inventory view:", error);
    next({ status: 500, message: "Internal Server Error" });
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await invModel.getClassificationsSelect()
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classifications: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}


module.exports = invCont