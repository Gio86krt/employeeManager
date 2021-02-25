create database employees_db;

use employees_db;

create table employees (
    id int AUTO_INCREMENT not null primary key, 
    firstname varchar(30),
    lastname varchar(30),
    roleid int not null,
    managerid int(10)
);

create table department (
   id int AUTO_INCREMENT not null primary key, 
   departmentname varchar(30) 
);

create table _role (
    id int AUTO_INCREMENT not null primary key, 
    title varchar(30),
    salary decimal(10,4),
    department_id int
 );


 insert into eployees (firstname, lastname, roleid, managerid) values ("Frank","Castle", 1,1);   --(select from _role where title="Manager" and )
 insert into eployees (firstname, lastname, roleid, managerid) values ("Steve","Rogers", 1,2);
 insert into eployees (firstname, lastname, roleid, managerid) values ("Tony","Stark", 1,1);
 insert into eployees (firstname, lastname, roleid, managerid) values ("Thor","Godofthunder", 1,2);
 insert into eployees (firstname, lastname, roleid, managerid) values ("Wade","Wilson", 4,2);
 insert into eployees (firstname, lastname, roleid, managerid) values ("Scarlett","Johansonn", 1,null);
 insert into eployees (firstname, lastname, roleid, managerid) values ("Marilyn","Monroe", 3,null);
 insert into department (departmentname) values ("IT");
 insert into department (departmentname) values ("PRODUCTION");
 insert into department (departmentname) values ("SALES");
 insert into _role (title, salary, department_id) values ("Manager", 90.000, 1);
 insert into _role (title, salary, department_id) values ("supervisor", 60.000, 3);
 insert into _role (title, salary, department_id) values ("Worker", 50.000, 2);
 insert into _role (title, salary, department_id) values ("Intern", 35.000, 1);
