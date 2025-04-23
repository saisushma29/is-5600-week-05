const path = require('path');
const Products = require('./products');
const autoCatch = require('./lib/auto-catch');
const Orders = require('./orders');

/**
 * Handle the root route
 * @param {object} req
 * @param {object} res
 */
function handleRoot(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
}

/**
 * List all products
 * @param {object} req
 * @param {object} res
 */
async function listProducts(req, res) {
  // Extract the limit and offset query parameters
  const { offset = 0, limit = 25, tag } = req.query;

  // Pass the limit and offset to the Products service
  const products = await Products.list({
    offset: Number(offset),
    limit: Number(limit),
    tag
  });

  res.json(products);
}

/**
 * Get a single product
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
async function getProduct(req, res, next) {
  const { id } = req.params;
  
  const product = await Products.get(id);
  if (!product) {
    return next(); // If product not found, pass to the next middleware
  }

  return res.json(product);
}

/**
 * Create a product
 * @param {object} req 
 * @param {object} res 
 */
async function createProduct(req, res) {
  console.log('request body:', req.body);

  // Create the product and send the response
  const product = await Products.create(req.body);
  res.json(product);
}

/**
 * Edit a product
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
async function editProduct(req, res, next) {
  const { id } = req.params;
  const change = req.body;

  const product = await Products.edit(id, change);
  if (!product) {
    return next(); // If product not found, pass to the next middleware
  }

  res.json(product);
}

/**
 * Delete a product
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function deleteProduct(req, res, next) {
  const { id } = req.params;

  const response = await Products.destroy(id);
  res.json(response);
}

/**
 * Create an order
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function createOrder(req, res, next) {
  const order = await Orders.create(req.body);
  res.json(order);
}

/**
 * List orders
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function listOrders(req, res, next) {
  const { offset = 0, limit = 25, productId, status } = req.query;

  const orders = await Orders.list({
    offset: Number(offset),
    limit: Number(limit),
    productId,
    status
  });

  res.json(orders);
}

async function editOrder(req, res, next) {
  const change = req.body;
  const order = await Orders.edit(req.params.id, change);
  res.json(order);
}

async function deleteOrder(req, res, next) {
  const response = await Orders.destroy(req.params.id);
  res.json(response);
}

module.exports = autoCatch({
  handleRoot,
  listProducts,
  getProduct,
  createProduct,
  editProduct,
  deleteProduct,
  listOrders,
  createOrder,
  editOrder,
  deleteOrder
});
