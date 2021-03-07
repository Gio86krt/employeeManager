const mysql = require("mysql");
const inquirer = require("inquirer");
const Choice = require("inquirer/lib/objects/choice");
let ormSearch;
let newSearch;
let starter;
// const showAllEmployees = ormSearch.showAllEmployees;

const db = require("../back-end/connection")("employees_db", "mySQL86giovanni");

async function getDept() {
  let departments = [];
  await db.query(`select departmentname from department;`).then((res) => {
    for (let i = 0; i < res.length; i++) {
      departments.push(res[i].departmentname);
    }
  });
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
  starter = require("../starter/starter");
  ormSearch = require("./ormSearch.js");
  newSearch = ormSearch.newSearch;
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
                    .then(async (res) => {
                      const [name, lastname] = res.fired.split(" ");
                      await db
                        .query(
                          `SELECT * FROM employees WHERE firstname="${name}" AND lastname="${lastname}";`
                        )
                        .then((res) => console.table(res));
                      let input = `firstname="${name}" AND lastname="${lastname}"`;
                      deleteStuff("employees", input);
                    });
                  break;
                case "Department":
                  //////////
                  let departments = await getDept();
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
                    })
                    .then((res) => newSearch());
                  break;
                case "Role":
                  const roles = await getRoles();
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
                    })
                    .then((res) => newSearch());
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
                  /////look for an employee
                  const employee = await inquirer
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
                    .then(async (res) => {
                      //   console.log(res, "  RES");
                      if (res === undefined) {
                        console.log(`Employee not found!`);
                        newSearch();
                      } else {
                        console.table(res);
                        return res;
                      }
                    })
                    .catch((err) => console.log(`Employee not found!`));

                  // console.log(employee);
                  //////change stuff
                  inquirer
                    .prompt({
                      message: `Insert field and new value (Example:  firstname "John"): `,
                      type: "input",
                      name: "input",
                    })
                    .then(async (res) => {
                      const [col, newValue] = res.input.split(" ");
                      //   console.log(col, " COL", newValue, "  NEW");
                      let [oldValue] = await db.query(
                        `SELECT ${col} FROM employees WHERE id=${employee.id}`
                      );

                      oldValue = eval(`${`oldValue.` + col}`);
                      //   console.log(oldValue, "   OLDVALUE");
                      updateEntry("employees", col, oldValue, newValue);
                    })
                    .then((res) => newSearch());
                  break;
                case "Department":
                  //////////update department info
                  let department;
                  let departments = await getDept();
                  console.log(departments, "   UPDATE FUNC");
                  inquirer
                    .prompt({
                      message: `Select department: `,
                      type: "rawlist",
                      name: "department",
                      choices: [...departments],
                    })
                    .then((res) => {
                      department = res.department;
                      inquirer
                        .prompt({
                          message: "Insert New Department Name:",
                          type: "input",
                          name: "newname",
                        })
                        .then(async (res) => {
                          //   console.log(res);
                          //   console.log(department);
                          const result = await db.query(
                            `UPDATE department SET departmentname="${res.newname}" WHERE departmentname="${department}";`
                          );
                          console.table(result);
                        })
                        .then((res) => newSearch());
                    });

                  break;
                case "Roles":
                  let role;
                  const roles = await getRoles();
                  const selection = await inquirer
                    .prompt({
                      message: "Select role: ",
                      type: "rawlist",
                      name: "role",
                      choices: [...roles],
                    })
                    .then((res) => (role = res.role));
                  //   console.log(role);

                  const search = await db
                    .query(`SELECT * FROM _role WHERE title="${selection}";`)
                    .then((res) => console.table(res));

                  inquirer
                    .prompt({
                      message:
                        "Insert Field and New Value (Example title Director):",
                      type: "input",
                      name: "newtitle",
                    })
                    .then(async (res) => {
                      let [col, newValue] = res.newtitle.split(" ");
                      let [oldValue] = await db.query(
                        `SELECT ${col} FROM _role WHERE title="${role}";`
                      );
                      // console.log(oldValue);
                      oldValue = eval(`${`oldValue.` + col}`);
                      updateEntry("_role", col, oldValue, newValue);
                      console.table(res);
                    })
                    .then((res) => newSearch());

                  break;
              }
            });
          break;
        case "ADD":
          ///////////INSERT INTO table (col1, col2) VALUES (val1, val2)///////////////
          //inquirer: do you want to add: employee, department, role//////////////////
          inquirer
            .prompt({
              message: "Select option:",
              type: "rawlist",
              choices: ["ADD an Employee", "ADD a Department", "ADD a Role"],
              name: "option",
            })
            .then(async (res) => {
              switch (res.option) {
                case "ADD an Employee":
                  let input = "";
                  const departments = await getDept();
                  const roles = await getRoles();
                  inquirer
                    .prompt({
                      message: "Insert new employee NAME, LASTNAME",
                      type: "input",
                      name: "new",
                    })
                    .then(async (res) => {
                      input += `"${res.new.trim().replace(" ", '","')}"`;
                      // console.log(input);
                      inquirer
                        .prompt({
                          message: "Select role: ",
                          type: "list",
                          choices: [...roles],
                          name: "role",
                        })
                        .then(async (res) => {
                          // console.log(res.role);
                          input =
                            input + " " + eval(roles.indexOf(res.role) + 1);
                          // console.log(input);
                        })
                        .then((res) => {
                          inquirer
                            .prompt({
                              message: "Select Department: ",
                              choices: [...departments],
                              type: "list",
                              name: "dept",
                            })
                            .then(async (res) => {
                              let [managers] = await db.query(
                                `SELECT id FROM employees WHERE roleid=${eval(
                                  departments.indexOf(res.dept) + 1
                                )};`
                              );
                              input += ` ${managers.id}`;
                              input = input.replace(/ /gi, ",");
                              console.log(input);
                              // console.log(managers.id);
                              await db.query(
                                `INSERT INTO employees (firstname, lastname, roleid, managerid) VALUES (${input});`
                              );
                              console.log("New Employee inserted.");
                            })
                            .then((res) => newSearch());
                        });
                    });
                  break;
                case "ADD a Department":
                  inquirer
                    .prompt({
                      message: "Insert new Daprtment name: ",
                      type: "input",
                      name: "dept",
                    })
                    .then(async (res) => {
                      await db
                        .query(
                          `INSERT INTO department (departmentname) VALUES ("${res.dept}");`
                        )
                        .then((res) => {
                          console.log("New Department created");
                          newSearch();
                        });
                    });
                  break;
                case "ADD a Role":
                  const departmentsList = await getDept();
                  let id;
                  console.log(departmentsList);
                  inquirer
                    .prompt({
                      message: "Select Department: ",
                      choices: [...departmentsList],
                      type: "list",
                      name: "dept",
                    })
                    .then((res) => {
                      id = eval(departmentsList.indexOf(res.dept) + 1);
                      inquirer
                        .prompt({
                          message: "Insert New Title and Salary: ",
                          type: "input",
                          name: "new",
                        })
                        .then(async (res) => {
                          let str = res.new.replace(" ", '",');
                          await db.query(
                            `INSERT INTO _role (title, salary, departmentid) VALUES ("${str},${id});`
                          );
                          console.log("New Role insterted");
                        })
                        .then((res) => newSearch());
                    });
                  break;
              }
            });

          ///switch statement
          //db.query(hardcode table name) similar to update for col and value
          break;
      }
    });
}

const updateEntry = async (table, col, oldValue, newValue) => {
  const result = await db.query(
    `UPDATE ${table} SET ${col}="${newValue}" WHERE ${col}="${oldValue}";`
  );
  console.table(result);
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
            setTimeout(() => newSearch(), 3000);
          });
        return;
      } else newSearch();
    });
};

module.exports = {
  updateData,
  getRoles,
  getDept,
};
