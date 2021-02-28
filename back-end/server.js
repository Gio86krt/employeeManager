const sql = require("mysql");
const express = require("express");
const inquirer = require("inquirer");
const ormSearch = require("../assets/ormSearch");
const ormUpdate = require("../assets/ormUpdate");
const table = require("console.table");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { restoreDefaultPrompts } = require("inquirer");
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require("constants");

const app = express();

const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = require("./connection")("employees_db", "mySQL86kyokushin");

async function getStarted() {
  //welcomeMessage();
  return (result = await inquirer
    .prompt({
      message: "What would you like to do today?",
      type: "rawlist",
      choices: ["SEARCH DATA", "UPDATE DATA"],
      name: "action",
    })
    .then((res) => {
      // console.log(res.action);
      switch (res.action) {
        case "SEARCH DATA":
          ormSearch.searchData();
          break;
        case "UPDATE DATA":
          ormUpdate.updateData();
          break;
      }
    }));
}

getStarted();

app.listen(port, () => {
  console.log(`Server si running at port: `, port);
});
