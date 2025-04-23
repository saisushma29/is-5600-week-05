const fs = require('fs').promises
const path = require('path')
const cuid = require('cuid')
const db = require('./db')

const productsFile = path.join(__dirname, 'data/full-products.json')

// Define Product Model
const Product = db.model('Product', {
  _id: { type: String, default: cuid },
  description: { type: String },
  alt_description: { type: String },
  likes: { type: Number, required: true },
  urls: {
    regular: { type: String, required: true },
    small: { type: String, required: true },
    thumb: { type: String, required: true },
  },
  links: {
    self: { type: String, required: true },
    html: { type: String, required: true },
  },
  user: {
    id: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String },
    portfolio_url: { type: String },
    username: { type: String, required: true },
  },
  tags: [{
    title: { type: String, required: true },
  }],
});

/**
 * List products
 * @param {Object} options
 * @param {number} options.offset
 * @param {number} options.limit
 * @param {string} options.tag
 * @returns {Promise<Object[]>}
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, tag } = options;

  // Try fetching from the database if a tag is provided
  const query = tag ? { tags: { $elemMatch: { title: tag } } } : {};
  const dbProducts = await Product.find(query)
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

  if (dbProducts.length > 0) {
    return dbProducts;
  }

  // Fallback to JSON file if no products are found in the database
  const data = await fs.readFile(productsFile);
  const products = JSON.parse(data)
    .filter(product => {
      if (!tag) return true;
      return product.tags.find(({ title }) => title === tag);
    })
    .slice(offset, offset + limit);

  return products;
}

/**
 * Get a single product by ID
 * @param {String} _id
 * @returns {Promise<Object|null>}
 */
async function get(_id) {
  // Try fetching from the database
  const product = await Product.findById(_id);
  if (product) return product;

  // Fallback to JSON file if product is not found in the database
  const products = JSON.parse(await fs.readFile(productsFile));
  return products.find(p => p.id === _id) || null;
}

/**
 * Create a new product
 * @param {Object} fields
 * @returns {Promise<Object>}
 */
async function create(fields) {
  const product = new Product(fields);
  await product.save();
  return product;
}

/**
 * Edit an existing product
 * @param {String} _id
 * @param {Object} change
 * @returns {Promise<Object|null>}
 */
async function edit(_id, change) {
  const product = await Product.findById(_id);
  if (!product) return null;

  // Update product fields
  Object.keys(change).forEach(key => {
    product[key] = change[key];
  });

  await product.save();
  return product;
}

/**
 * Delete a product
 * @param {String} _id
 * @returns {Promise<Object>}
 */
async function destroy(_id) {
  return await Product.deleteOne({ _id });
}

module.exports = {
  list,
  get,
  create,
  edit,
  destroy,
};
