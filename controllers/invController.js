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




module.exports = invCont