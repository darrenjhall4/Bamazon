var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');
require("dotenv").config();

var keys = require("./keys.js");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: keys.database.pwd,
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  displayProducts();
});

function displayProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
      console.table(res);

    userInput();
  });
}

function userInput() {
  inquirer.prompt([

    {
      type: "input",
      name: "productID",
      message: "Enter product ID number:"
    },

      {
        type: "input",
        name: "quantity",
        message: "How many?"
      }
  ]).then(function(response){
    connection.query("SELECT * FROM products WHERE id = ?", response.productID, function(err, res) {
      console.log("Total: $" + (res[0].price * response.quantity));
      var total = "Checkout Balance: $" + (res[0].price * response.quantity);
      if (response.quantity <= res[0].stock) {
        connection.query("UPDATE products SET stock = stock - ? WHERE ID=?", [response.quantity, response.productID], function(err, res) {
          if (res) {
            console.log("Your order has been processed!");
            console.log(total);
 
          }
          if (err) {
            console.log(err)
          }
         })
        } else {
          console.log("Sorry, insufficient quantity");
        }
        continueShopping();
    })
  })
}

function continueShopping() {
  inquirer.prompt([

    {
      type: "list",
      name: "choice",
      message: "Continue shopping?",
      choices: ["Yes", "No"]
    }
  ]).then (function(response){
    if (response.choice === "No") {
      console.log("To proceed to checkout, bring your total to Darren Hall in unmarked ca$h.");
      connection.end();
      process.exit(0);
    } else {
      displayProducts();
    }
});
}

