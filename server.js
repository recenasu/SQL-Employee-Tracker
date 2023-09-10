// Define variables and functions to import required modules.
const fs = require('fs');
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();
const consoleTable = require('console.table');
const express = require('express');

const PORT = process.env.PORT || 3001;
const app = express();


// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// ***ADD DEPARTMENT*** This function adds a department to the database.
function addDept() {

    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please enter the name of the new department: (less than 30 characters)',
                name: 'newDept',
            }
        ])
        .then((response) => {

            var sql = `INSERT INTO department (name) VALUES ('${response.newDept}')`;

            // Connect to database
            const db = mysql.createConnection(
                {
                    host: 'localhost',
                    user: process.env.DB_USER,
                    password: process.env.DB_USER_PASSWORD,
                    database: process.env.DB_NAME
                },
            );

            // Run query, display results in the console:
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                }
                // Insert blank line before result for better readability
                console.log(`\n ${response.newDept} department added.`);
                init();
            });

        })


}
// ***RUN QUERY*** This function runs one of the canned queries and prints the result to the console. The name of the .sql file containing the query is the argument.
function runQuery(queryFile) {

    // Connect to database
    const db = mysql.createConnection(
        {
            host: 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_USER_PASSWORD,
            database: process.env.DB_NAME
        },
    );
    // Assign query .sql file to variable
    let sql = fs.readFileSync(`./db/${queryFile}`, 'utf-8');

    // Run query, display results in the console:
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        }
        // Insert blank line before result for better readability
        console.log('\n')
        console.table(result);
        init();
    });
}

// This function executes the program.
function init() {
    console.log('**EMPLOYEE TRACKER**')

    // Inquirer prompts:
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'What would you like to do?',
                name: 'initialSelection',
                choices: [
                    'View All Departments',
                    'View All Roles',
                    'View All Employees',
                    'Add a Department',
                    'Add a Role',
                    'Add an Employee',
                    'Update an Employee Role'
                ]
            }
        ])
        .then((response) => {

            // Execute function based on selection.
            switch (response.initialSelection) {
                case 'View All Departments':
                    runQuery('departments_query.sql');
                    break;
                case 'View All Roles':
                    runQuery('roles_query.sql');
                    break;
                case 'View All Employees':
                    runQuery('employees_query.sql');
                    break;
                case 'Add a Department':
                    addDept();
                    break;
                case 'Add a Role':
                    console.log('good choice!');
                    // addRole();
                    break;
                case 'Add an Employee':
                    console.log('good choice!');
                    // addEmployee();
                    break;
                case 'Update an Employee Role':
                    console.log('good choice!');
                    // updateEmployeeRole();
                    break;
                default:
                    console.log(`no selection`);
            };
        });

};

init();



