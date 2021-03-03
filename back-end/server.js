const sql = require("mysql");
const express = require("express");
// const inquirer = require("inquirer");
const starter = require("../starter/starter");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { restoreDefaultPrompts } = require("inquirer");
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require("constants");

const app = express();

const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = require("./connection")("employees_db", "mySQL86giovanni");

app.listen(port, () => {
  console.log(`Server si running at port: `, port);
  starter();
});
