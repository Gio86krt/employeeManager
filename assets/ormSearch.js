const mysql = require("mysql");
const inquirer = require("inquirer");

const db = require("../back-end/connection")(
  "employees_db",
  "mySQL86kyokushin"
);

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
          await db.query(`select distinct title from _role`).then((res) => {
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
                .then((res) => console.table(res));
            })
            .catch((err) => console.log(`Role not found!`));
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
              ).then((res) => console.table(res)); /////returning rawdata package
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
              const [result] = await db.query(
                `select * from employees where firstname LIKE "%${name}%" AND lastname LIKE "%${lastName}%";`
              );
              console.table(result);
            })
            .catch((err) => console.log(`Employee not found!`));
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
            .then((res) => console.table(res))
            .catch((err) => console.log(`Not found!`));
      }
    });
}

module.exports = searchData;
