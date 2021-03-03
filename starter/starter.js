const inquirer = require("inquirer");
const express = require("express");
const app = express();
const ormSearch = require("../assets/ormSearch");
const ormUpdate = require("../assets/ormUpdate");

const db = require("../back-end/connection")("employees_db", "mySQL86giovanni");

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

module.exports = getStarted;
