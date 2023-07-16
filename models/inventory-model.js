const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


/* ***************************
 *  Get a specific vehicle in inventory by inventory_id
 * ************************** */
async function getVehicleById(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [inventory_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}

async function checkExistingClassification(classification_name) {
  try {
    const query = "SELECT * FROM classification WHERE classification_name = $1";
    const result = await pool.query(query, [classification_name]);
    return result.rowCount > 0; // Returns true if classification exists, false otherwise
  } catch (error) {
    console.error("Error checking existing classification:", error);
    return false;
  }
}

async function insertClassification(classificationName) {
  try {
    const query = "INSERT INTO classification (classification_name) VALUES ($1)";
    await pool.query(query, [classificationName]);
  } catch (error) {
    throw new Error("Error inserting classification into the database.");
  }
}

async function getClassificationsSelect() {
  try {
    const query = "SELECT * FROM public.classification ORDER BY classification_name";
    const { rows } = await pool.query(query);
    console.log(rows)
    return rows;
  } catch (error) {
    console.error("Error retrieving classifications:", error);
    throw error;
  }
}

async function insertInventory(inventoryData) {
  const {
    make,
    model,
    year,
    description,
    classification,
    image,
    thumbnail,
    price,
    miles,
    color,
  } = inventoryData;

  try {
    const query =
      "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, classification_id, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
    await pool.query(query, [
      make,
      model,
      year,
      description,
      classification,
      image,
      thumbnail,
      price,
      miles,
      color,
    ]);
  } catch (error) {
    throw new Error("Error inserting inventory item into the database.");
  }
}

async function findClassyId(classificationName) {
  try {
    const query = "SELECT classification_id FROM public.classification WHERE classification_name = $1";
    const { rows } = await pool.query(query, [classificationName]);
    if (rows.length === 0) {
      throw new Error("Classification not found.");
    }
    return rows[0].classification_id;
  } catch (error) {
    console.error("Error finding classification ID:", error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}



/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function DeleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

async function fetchComments(classificationId) {
  let query = `SELECT comment, created_at FROM comments WHERE classification_id = $1 ORDER BY created_at DESC LIMIT 10`;
  try {
    let result = await pool.query(query, [classificationId]);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// in invModel.js or wherever your database functions are
async function getClassificationNameById(classificationId) {
  const query = "SELECT classification_name FROM classification WHERE classification_id = $1";
  const values = [classificationId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0].classification_name; // returns the name of the classification
  } catch (err) {
    console.error('Error executing query', err.stack);
  }
}
async function createComment(userId, classificationId, comment) {
  try {
    const query = `INSERT INTO comments (account_id, classification_id, comment, created_at) VALUES ($1, $2, $3, $4)`;
    const values = [userId, classificationId, comment, new Date()];
    const result = await pool.query(query, values);
    return result;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}


module.exports = {
  getClassifications,
  insertInventory,
  getClassificationsSelect,
  getInventoryByClassificationId,
  getVehicleById,
  findClassyId,
  checkExistingClassification,
  insertClassification,
  updateInventory,
  DeleteInventoryItem, fetchComments,getClassificationNameById,createComment
};
