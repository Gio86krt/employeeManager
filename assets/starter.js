const inquirer = require("inquirer");
const ormSearch = require("./ormSearch");
const ormUpdate = require("./ormUpdate");

const db = require("../back-end/connection")(
  "employees_db",
  "mySQL86kyokushin"
);

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
