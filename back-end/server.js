const sql = require("mysql");
const express = require("express");
const inquirer = require("inquirer");
const fs = require("fs");
const { CLIENT_RENEG_LIMIT } = require("tls");

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
      console.log(res.action);
      switch (res.action) {
        case "SEARCH DATA":
          searchData();
          break;
        case "UPDATE DATA":
          updateData();
          break;
      }
    }));

  // .finally((res) => console.log(res + "System logged out"));
}

getStarted();

async function searchData() {
  return await inquirer
    .prompt({
      message: "Search by:",
      type: "rawlist",
      choices: ["Role", "Department", "Name"],
      name: "criteria",
    })
    .then((res) => {
      switch (res.criteria) {
        case "Role":
          let roles = [];
          const result = db.query(`select title from _role`).then((res) => {
            for (let i = 0; i < res.length; i++) {
              roles.push(res[i].title);
            }
          });
          console.log(roles);
          inquirer.prompt({
            message: "What role do you want to search?",
            type: "rawlist",
            name: "role",
            choices: [roles],
          });
          const roleId = db.query(`select id from _role where title="";`);
          db.query(`SELECT * FROM employees WHERE roleid='${roleId}';`);
          break;
        case "Department":
          const departmentId = db.query(
            `select id from department where name="${res.criteria}";`
          );
          db.query(`SELECT * FROM employees WHERE deparid='${departmentid}';`);
          break;
        case "Name":
          const employeeName = db.query(
            `select id from employees where firstname="${res.criteria}" AND lastname="";`
          );
          db.query(`SELECT * FROM employees WHERE roleid='${roleId}';`);
          break;
      }
    });
}

function updateData() {}

app.listen(port, () => {
  console.log(`Server si running at port: `, port);
});
