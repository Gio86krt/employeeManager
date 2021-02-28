const inquirer = require("inquirer");
const mysql = require("mysql");
const { restoreDefaultPrompts } = require("inquirer");
const starter = require("./starter");
const ormUpdate = require("./ormUpdate");
const getRoles = ormUpdate.getRoles;
const getDept = ormUpdate.getDept;

const db = require("../back-end/connection")(
  "employees_db",
  "mySQL86kyokushin"
);

function newSearch() {
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
          /////close server
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
    });
}

async function getManagers() {
  const managers = [];
  const result = await db
    .query(
      `SELECT * FROM employees WHERE roleid = (select id from _role where title="Manager");`
    )
    .then((res) => {
      res.forEach((el) => {
        managers.push(`${el.firstname} ${el.lastname}`);
      });
    });
  return managers;
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
              // console.log(res.role, "RES.ROLE");
              const result = await db.query(
                `SELECT id FROM _role WHERE title='${res.role}';`
              );
              // console.log(result[0].id, "  RESULT INNER");
              return result[0].id;
            })
            .then(async (res) => {
              return await db
                .query(`SELECT * FROM employees WHERE roleid='${res}';`)
                .then((res) => {
                  console.table(res);
                  // newSearch();
                });
            })
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
                `select * from employees where managerid = (select id from _role where title="Manager" AND department_id=${
                  departments.indexOf(res.dept) + 1
                }); `
              ).then((res) => {
                console.table(res);
                // newSearch();
              });
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
                // newSearch();
              } else {
                console.table(res);
                // newSearch();
              }
            })
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
              // newSearch();
            })
            .catch((err) => console.log(`Not found!`));
          break;
        case "Show all Employees":
          showAllEmployees();
          // newSearch();
          break;
      }
    });
}

module.exports = {
  searchData: searchData,
  showAllEmployees: showAllEmployees,
};
