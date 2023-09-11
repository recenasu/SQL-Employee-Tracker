// Define variables and functions to import required modules.
const fs = require('fs');
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();
const consoleTable = require('console.table');

// Define variable for connecting to the database. This is used in all the query functions below.
var db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_USER_PASSWORD,
        database: process.env.DB_NAME
    },
);



// ***TABLE CALLBACK***
// This is the callback function used for queries that will return a displayed table. This is used for the canned queries the user can run.
function callbackTable(err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log('\n');
        console.table(result);
        init();
    }
}

// ***ARRAY CALLBACK***
// This is the callback function used for queries that will return an array. This is used for the queries used to populate inquirer menus.
function callbackArray(err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
        // return result;
    }
}

// ***RUN QUERY***
// This function runs one of the canned queries and executes the specified callback function. The name of the .sql file containing the query is the first argument. The name of the callback function is the second argument.
function runQuery(queryFile, callback) {

    // Assign query .sql file to variable
    let sql = fs.readFileSync(`./db/${queryFile}`, 'utf-8');

    // Run query, display results in the console:
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

// ***ADD ROLE*** 
// This function prompts the user for input, and then uses the user inputs to add a new role to the database.
function addRole() {

    // Execute the query
    db.query('SELECT name FROM department', (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        // Define a variable that will hold the department names pulled from the database. This will be used to populate the selection menu for the department prompt.
        var deptsMenu = result.map((row) => row.name);

        inquirer
            .prompt([
                {
                    type: 'input',
                    message: 'Please enter the title of the new role: (less than 30 characters)',
                    name: 'newRoleTitle',
                },
                {
                    type: 'input',
                    message: 'Please enter the salary for the new role: (round to the nearest dollar)',
                    name: 'newRoleSalary',
                },
                {
                    type: 'list',
                    message: 'Please select the department for the new role:',
                    name: 'newRoleDept',
                    choices: deptsMenu,
                }
            ])
            .then((response) => {

                db.query(`SELECT id FROM department WHERE name = '${response.newRoleDept}'`, (err, result) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    // Run query, display results in the console:
                    db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${response.newRoleTitle}', '${response.newRoleSalary}', ${result[0].id.toString()})`, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        // Insert blank line before result for better readability
                        console.log(`\n ${response.newRoleTitle} role added.`);
                        init();
                    });
                });
            });
    });
};

// ***ADD DEPARTMENT*** 
// This function adds a new department to the database.
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
                    runQuery('departments_query.sql', callbackTable);
                    break;
                case 'View All Roles':
                    runQuery('roles_query.sql', callbackTable);
                    break;
                case 'View All Employees':
                    runQuery('employees_query.sql', callbackTable);
                    break;
                case 'Add a Department':
                    addDept();
                    break;
                case 'Add a Role':
                    addRole();
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



