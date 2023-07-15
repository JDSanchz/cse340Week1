const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    console.log("no data")
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    grid += '</ul>'
  }
  return grid
}

/* **************************************
 * Build HTML for specific vehicle detail view
 * ************************************ */
Util.wrapVehicleDataInHTML = function (vehicleData) {
  const { inv_make, inv_model, inv_year, inv_price, inv_miles, inv_image } = vehicleData;

  const html = `
    <div class="container">
      <div class="title">
        <h1>${inv_make} ${inv_model}</h1>
      </div>
      <div class="content">
        <div class="image">
          <img src="${inv_image}" alt="Full-size image of ${inv_make} ${inv_model}" />
        </div>
        <div class="info">
          <p>Make: ${inv_make}</p>
          <p>Model: ${inv_model}</p>
          <p>Year: ${inv_year}</p>
          <p>Price: $${new Intl.NumberFormat('en-US').format(inv_price)}</p>
          <p>Mileage: ${new Intl.NumberFormat('en-US').format(inv_miles)}</p>
          <!-- Add additional descriptive data as needed -->
        </div>
      </div>
    </div>
  `;

  return html;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 Util.checkAdminOrEmployee = async (req, res, next) => {
  if (res.locals.loggedin) {
    const accountType = res.locals.accountData.account_type;
    if (accountType === "Employee" || accountType === "Admin") {
      next();
    } else {
       console.log(accountType)
      await req.flash("notice", "You do not have sufficient permissions to access this resource.");
      res.clearCookie("jwt");
      return res.redirect("/account/login");
    }
  } else {
    await req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
}



module.exports = Util