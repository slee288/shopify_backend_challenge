var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

var Product = require("./models/Product");

// Resolver collections to be used as functions in GraphQL
const resolvers = {

  // Returns all products
  // Yet, it only returns products with at least one existing product in inventory
  products: () => {
    return Product.find({ inventory_count: { $gt: 0 } }, function(err, products){
      if(err) throw err;
      return products;
    });
  },

  // Creates a product
  createProduct: async (args) => {
    var title = args.productInput.title;
    var price = args.productInput.price;
    var inventoryCount = args.productInput.inventory_count;

    const existingProduct = await Product.findOne({ title: title });

    // If product with the same name exists, returns error
    if(existingProduct) {
      throw new Error("Product with the same name already exists");
    }
    // If either price or inventory count is less than zero, returns error
    else if(price < 0) {
      throw new Error("Cannot have a price of negative value");
    } else if(inventoryCount < 0) {
      throw new Error("Cannot have an inventory count of negative value");
    }
    // No error
    else {
      // Create a new Product with the input
      const product = new Product({
        title: title,
        price: price,
        inventory_count: inventoryCount
      });

      // Save the product in database, and returns the product information
      // to GraphQL interface
      product.save().then(result => {
        return {...result._doc};
      }).catch(err => {
        throw err;
      });
      return product;
    }
  },

  // Searches products
  getProduct: async (args) => {
    var title = args.title;

    // Finds all products where the input string matches product names
    return Product.find({
        title: {"$regex": title, "$options": "i"},  // case insensitive
        inventory_count: { $gt: 0 } },
        function(err, products) {
      if(err) throw err;
      return products;
    });
  },

  // Purchase product; user can only buy one product at a time,
  // but could buy them as much as possible, as long as there are enough
  // quantity in the inventory
  purchaseProduct: async (args) => {
    var title = args.purchaseInput.title;
    var quantity = args.purchaseInput.quantity;

    const product = await Product.findOne( {title: title} );

    // Cannot find name
    if(!product) {
      throw new Error("Product result not found");
    }
    // Trying to buy negative quantity of items
    else if(quantity <= 0) {
      throw new Error("Cannot buy quantity of less than 0");
    }
    // No errors
    else {
      if(product.inventory_count - quantity < 0) {
        throw new Error("Not enough products available in the inventory");
      }

      // Update product inventory count
      product.inventory_count -= quantity;
      product.save().then(result => {
        console.log(result);
        return {...result._doc};
      }).catch(err => {
        console.log(err);
        throw err;
      });
      return product;
    }
  }
}

module.exports = resolvers;
