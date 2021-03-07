-- create database employees_db;

use employees_db;

create table department (
   id int AUTO_INCREMENT not null primary key, 
   departmentname varchar(30) 
);

create table _role (
    id int AUTO_INCREMENT not null primary key, 
    title varchar(30),
    salary decimal(10,4),
    departmentid int,
    FOREIGN KEY (departmentid) REFERENCES department(id)
 );

create table employees (
    id int AUTO_INCREMENT not null primary key, 
    firstname varchar(30),
    lastname varchar(30),
    -- roleid int not null,
    -- managerid int,
    FOREIGN KEY (managerid) REFERENCES _role(id),
	FOREIGN KEY (roleid) REFERENCES _role(id)
);
 

