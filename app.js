var express = require("express");
var { buildSchema } = require("graphql");
var graphqlHTTP = require("express-graphql");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var FormatError = require("easygraphql-format-error");

// resolver functions
var root = require("./resolvers");

var app = express();
app.use(bodyParser.json());

//
const formatError = new FormatError ([]);

// GraphQL middleware
// Schemas are type and query declarations for GraphQL interface
//  - Product object has three fields: title, price, inventory count
//  - ProductInput is input to be used for finding all products
//  - PurchaseInput is query to be used for buying products
app.use("/graphql", graphqlHTTP({
  schema: buildSchema(`
    type Product {
      _id: ID!
      title: String!
      price: Float!
      inventory_count: Int!
    }

    input ProductInput {
      title: String!
      price: Float!
      inventory_count: Int!
    }

    input PurchaseInput {
      title: String!
      quantity: Int!
    }

    type RootQuery{
      products: [Product!]!
      getProduct(title: String!): [Product]!
      purchaseProduct(purchaseInput: PurchaseInput): Product!
    }

    type RootMutation {
      createProduct(productInput: ProductInput): Product
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: root,
  formatError: (err) => {
    return formatError.getError(err);
  },
  graphiql: true
}));

// Connect to MongoDB for data storage
// Used MLab for online server
mongoose.connect('mongodb://slee:1q2w3e4r!@ds161074.mlab.com:61074/marketplace');


// Listening for port 4000, OR wherever it is deployed to
app.set('port', (process.env.PORT || 4000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
