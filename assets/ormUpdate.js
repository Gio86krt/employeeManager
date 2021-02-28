const inquirer = require("inquirer");
const mysql = require("mysql");

const db = require("../back-end/connection")(
  "employees_db",
  "mySQL86kyokushin"
);

async function getDept() {
  let departments = [];
  await db.query(`select departmentname from department;`).then((res) => {
    for (let i = 0; i < res.length; i++) {
      departments.push(res[i].departmentname);
    }
  });
  //   console.log(departments);
  return departments;
}

async function getRoles() {
  let roles = [];
  await db.query(`SELECT DISTINCT title FROM _role;`).then((res) => {
    res.forEach((el) => {
      roles.push(el.title);
    });
  });
  return roles;
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
                  //////////
                  let departments = getDept();
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
                  const roles = getRoles();
                  inquirer
                    .prompt({
                      message: "Select a role: ",
                      type: "rawlist",
                      choices: [...roles],
                      name: "role",
                    })
                    .then((res) => {
                      console.log(res.role);
                      let input = `title="${res.role}"`;
                      deleteStuff("_role", input);
                    });
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
                  //////////update department info
                  let departments = await getDept();
                  console.log(departments, "   UPDATE FUNC");
                  inquirer
                    .prompt({
                      message: `Select department: `,
                      type: "rawlist",
                      name: "department",
                      choices: [...departments],
                    })
                    .then((res) => console.log(res.department));
                  break;
                case "Roles":
                  const roles = getRoles();
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

module.exports = updateData;
