const sql = require("mysql");
const express = require("express");
const inquirer = require("inquirer");
const fs = require("fs");
const { CLIENT_RENEG_LIMIT } = require("tls");
const table = require("console.table");
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
}

getStarted();

async function searchData() {
  return await inquirer
    .prompt({
      message: "Search by:",
      type: "rawlist",
      choices: ["Role", "Department", "Name", "Manager"],
      name: "criteria",
    })
    .then(async (res) => {
      switch (res.criteria) {
        case "Role":
          let roles = [];
          await db.query(`select title from _role`).then((res) => {
            for (let i = 0; i < res.length; i++) {
              roles.push(res[i].title);
            }
          });
          console.log(roles);
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
                .then((res) => console.log(res));
            });
          break;
        ////////////////////////this works!!!
        case "Department":
          let departments = [];
          await db
            .query(`select departmentname from department;`)
            .then((res) => {
              for (let i = 0; i < res.length; i++) {
                departments.push(res[i].departmentname);
              }
            });
          // console.log(departments);
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
              ).then((res) => console.log(res)); /////returning rawdata package
            });
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
              const [result] = await db.query(
                `select * from employees where firstname LIKE "%${name}%" AND lastname LIKE "%${lastName}%";`
              );
              console.log(result);
            });
          break;
        case "Manager":
          const managers = [];
          const result = await db
            .query(
              `SELECT * FROM employees WHERE roleid = (select id from _role where title="Manager");`
            )
            .then((res) => {
              console.log(res);
              res.forEach((el) => {
                managers.push(`${el.firstname} ${el.lastname}`);
              });
              return res;
            });

          // console.log(managers);
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
            .then((res) => console.log(res));
      }
    });
}

async function updateData() {
  inquirer
    .prompt({
      message: "Please select an action: ",
      choices: ["DELETE", "UPDATE", "ADD"],
      name: "action",
      type: "rawlist",
    })
    .then((res) => {
      console.log(res.action);

      switch (res.action) {
        case "DELETE":
          inquirer
            .prompt({
              message: `Delete by: `,
              type: "rawlist",
              choices: ["Employee", "Department", "Role"],
              name: "choice",
            })
            .then(async (res) => {
              switch (res.choice) {
                case "Employee":
                  inquirer
                    .prompt({
                      message: "Insert Employee's first and last name: ",
                      type: "input",
                      name: "fired",
                    })
                    .then((res) => {
                      const [name, lastname] = res.fired.split(" ");
                      let input = `firstname="${name}" AND lastname="${lastname}"`;
                      deleteStuff("employees", input);
                    });
                  break;
                case "Department":
                  let departments = [];
                  await db
                    .query(`select departmentname from department;`)
                    .then((res) => {
                      for (let i = 0; i < res.length; i++) {
                        departments.push(res[i].departmentname);
                      }
                    });
                  inquirer
                    .prompt({
                      message: "Select Department: ",
                      type: "rawlist",
                      choices: [...departments],
                      name: "department",
                    })
                    .then((res) => {
                      let input = `departmentname="${res.department}"`;
                      deleteStuff("department", input);
                    });
                  break;
                case "Role":
                  let roles = [];
                  await db
                    .query(`SELECT DISTINCT title FROM _role;`)
                    .then((res) => {
                      res.forEach((el) => {
                        roles.push(el.title);
                      });
                    });

                  inquirer
                    .prompt({
                      message: "Select a role: ",
                      type: "rawlist",
                      choices: [...roles],
                      name: "role",
                    })
                    .then((res) => console.log(res.role));
                  break;
              }
            });
          break;
        case "UPDATE":
          inquirer
            .prompt({
              message: `Update: `,
              type: "rawlist",
              choices: ["Employee info", "Department", "Roles"],
              name: "update",
            })
            .then(async (res) => {
              switch (res.update) {
                case "Employee info":
                  inquirer
                    .prompt({
                      message: `Insert field and new value (Example:  firstname "John"): `,
                      type: "input",
                      name: "input",
                    })
                    .then((res) => {
                      res.input.split(" ");
                      updateEntry("employees");
                    });
                  break;
                case "Department":
                  break;
                case "Roles":
                  break;
              }
            });
          break;
        case "ADD":
          break;
      }
    });
}

const updateEntry = async (table, col, oldValue, newValue) => {
  const result = await db.query(
    `UPDATE ${table} SET ${col}=${newValue} WHERE ${col}=${oldValue};`
  );
  return result;
};

const deleteStuff = async (table, input) => {
  ///////////DELETE FROM table WHERE condition
  inquirer
    .prompt({
      message: "Are you sure?",
      type: "rawlist",
      choices: ["YES", "NO"],
      name: "sure",
    })
    .then(async (res) => {
      if (res.sure === "YES") {
        const result = await db
          .query(`DELETE FROM ${table} WHERE ${input};`)
          .then((res) => {
            console.log(`Entry deleted`);
            setTimeout(() => getStarted(), 3000);
          });
        return;
      } else getStarted();
    });
};

app.listen(port, () => {
  console.log(`Server si running at port: `, port);
});
