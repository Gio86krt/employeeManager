const inquirer = require("inquirer");
const mysql = require("mysql");
const { restoreDefaultPrompts } = require("inquirer");
let starter;
const ormUpdate = require("./ormUpdate");
const getRoles = ormUpdate.getRoles;
const getDept = ormUpdate.getDept;

const db = require("../back-end/connection")("employees_db", "mySQL86giovanni");

function newSearch() {
  starter = require("../starter/starter");
  inquirer
    .prompt({
      message: "Keep working?",
      choices: ["YES", "NO"],
      type: "rawlist",
      name: "keep",
    })
    .then((res) => {
      switch (res.keep) {
        case "YES":
          starter();
          break;
        case "NO":
          setImmediate(function () {
            process.exit();
          });
          break;
      }
    });
}

async function showAllEmployees() {
  let employees = await db
    .query(`SELECT firstname, lastname FROM employees;`)
    .then((res) => {
      console.table(res);
      ////////////////should also be showing dapartment and id
    })
    .then((res) => newSearch());
}

async function getManagers() {
  const managers = [];
  const ids = await db
    .query(`SELECT id FROM _role WHERE title="Manager"`)
    .then((res) => {
      // console.log(res, "   IDS");
      // console.log(ids);
      res.forEach(async (el) => {
        // console.log(el.id, "  EL.ID");
        await db
          .query(`SELECT * FROM employees WHERE roleid=${el.id};`)
          .then((res) => {
            console.log(res, "  RES inner");
            res.forEach((el) => {
              managers.push(`${el.firstname} ${el.lastname}`);
            });
            return managers;
          });
        return managers;
      });
      console.log(managers, "   MANAGERS middle");
      return managers;
    });
}

async function searchData() {
  return await inquirer
    .prompt({
      message: "Search by:",
      type: "rawlist",
      choices: ["Role", "Department", "Name", "Manager", "Show all Employees"],
      name: "criteria",
    })
    .then(async (res) => {
      switch (res.criteria) {
        case "Role":
          const roles = await getRoles();
          // console.log(roles);
          inquirer
            .prompt({
              message: "What role do you want to search?",
              type: "rawlist",
              name: "role",
              choices: [...roles],
            })
            .then(async (res) => {
              let results = [];

              const result = await db.query(
                `SELECT id FROM _role WHERE title='${res.role}';`
              );
              result.forEach(async (el) => {
                let person = await db.query(
                  `SELECT * FROM employees WHERE roleid='${el.id}';`
                );
                [person] = person;
                results.push(person);
                console.table(person); ////////////shows one table for every person
              });
              // console.table(results);
              return results;
            })
            .then((res) => {
              ///////////////////empty array
              console.log(res);
              // console.table(res);
            })
            .then((res) => newSearch())
            .catch((err) => console.log(`Role not found!`));
          break;
        ////////////////////////this works!!!
        case "Department":
          const departments = await getDept();
          inquirer
            .prompt({
              message: "Select department:",
              name: "dept",
              choices: [...departments],
              type: "rawlist",
            })
            .then((res) => {
              console.log(res.dept);
              db.query(
                `select * from employees where managerid = (select id from _role where title="Manager" AND departmentid=${
                  departments.indexOf(res.dept) + 1
                }); `
              )
                .then((res) => {
                  console.table(res);
                })
                .then((res) => newSearch());
            })
            .catch((err) => console.log(`Department not found!`));
          break;

        case "Name":
          inquirer
            .prompt({
              message: "Insert name:",
              type: "input",
              name: "name",
            })
            .then(async (res) => {
              const [name, lastName] = res.name.split(" ");
              console.log(name, lastName);
              if (!lastName) {
                const [result] = await db.query(
                  `select * from employees where firstname LIKE "%${name}%";`
                );
                return result;
              } else {
                const [result] = await db.query(
                  `select * from employees where firstname LIKE "%${name}%" AND lastname LIKE "%${lastName}%";`
                );
                return result;
              }
            })
            .then((res) => {
              // console.log(res, "  RES");
              if (res === undefined) {
                console.log(`Employee not found!`);
                newSearch();
              } else {
                console.table(res);
              }
            })
            .then((res) => newSearch())
            .catch((err) => console.log(`Employee not found!`));
          break;
        case "Manager":
          const managers = await getManagers();
          const manager = await inquirer
            .prompt({
              message: "Select Manager",
              type: "rawlist",
              choices: [...managers],
              name: "manager",
            })
            .then(async (res) => {
              // console.log(res, "    manager");
              return res.manager;
            });
          console.log(manager, " 2");
          const [name, lastname] = manager.split(" ");
          await db
            .query(
              `SELECT * FROM employees WHERE managerid = (SELECT id FROM employees WHERE lastname LIKE '%${lastname}%');`
            )
            .then((res) => {
              console.table(res);
            })
            .then((res) => newSearch())
            .catch((err) => console.log(`Not found!`));
          break;
        case "Show all Employees":
          showAllEmployees();

          break;
      }
    });
}

module.exports = {
  searchData,
  showAllEmployees,
  newSearch,
};
