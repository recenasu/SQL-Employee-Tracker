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
// Callback function used for queries that will return a displayed table. This is used for the canned queries the user can run.
function callbackTable(err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log('\n');
        console.table(result);
        init();
    }
}

// ***RUN QUERY***
// Runs one of the canned queries and executes the specified callback function. The name of the .sql file containing the query is the first argument. The name of the callback function is the second argument.
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


// ***ADD DEPARTMENT*** 
// Adds a new department to the database using user inputs.
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

            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log(`\n ${response.newDept} department added.\n`);
                init();
            });
        })
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
        // Variable to hold department names pulled from the database. Used to populate the selection menu for the 'newRoleDep' prompt.
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

                    db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${response.newRoleTitle}', '${response.newRoleSalary}', ${result[0].id.toString()})`, (err, result) => {
                        if (err) {
                            console.log(err);
                        }

                        console.log(`\n ${response.newRoleTitle} role added.\n`);
                        init();
                    });
                });
            });
    });
};


// ***ADD EMPLOYEE*** 
// This function prompts the user for inputs to add a new employee to the database.
function addEmployee() {

    // variables to hold arrays to populate menus for 'newEmployeeRole' and 'newEmployeeMgr' prompts
    var rolesMenu;
    var managersMenu;

    // Queries the database to return an array containing all role titles.
    function rolesQuery() {
        return new Promise((resolve, reject) => {
            db.query('SELECT title FROM role WHERE title != "-unassigned-"', (err, result) => {
                if (err) {
                    reject(err);
                } else {

                    rolesMenu = result.map((row) => row.title);
                    resolve()
                }
            });
        });
    };

    // Queries the database to return all manager first and last names concatentated into a single 'managers' array.
    function managersQuery() {
        return new Promise((resolve, reject) => {

            // Assign query .sql file to variable
            let sql = fs.readFileSync(`./db/managers_query.sql`, 'utf-8');

            db.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {

                    managersMenu = result.map((row) => row.managers);
                    resolve();
                }
            });
        });
    };

    // Execute both functions in sequence. Then step user through inputs with prompts.
    rolesQuery()
        .then(() => managersQuery())
        .then(() => {
            inquirer
                .prompt([
                    {
                        type: 'input',
                        message: 'What is the first name of the new employee? (less than 30 characters)',
                        name: 'newEmployeeFirst',
                    },
                    {
                        type: 'input',
                        message: 'What is the last name of the new employee? (less than 30 characters)',
                        name: 'newEmployeeLast',
                    },
                    {
                        type: 'list',
                        message: 'Please select the role for the new employee:',
                        name: 'newEmployeeRole',
                        choices: rolesMenu,
                    },
                    {
                        type: 'list',
                        message: 'Please select the manager of the new employee:',
                        name: 'newEmployeeMgr',
                        choices: managersMenu,
                    },
                    {
                        type: 'list',
                        message: 'Is the new employee a manager?',
                        name: 'isEmployeeMgr',
                        choices: [
                            'No',
                            'Yes'
                        ],
                    },
                ])
                .then((response) => {

                    // Get the employee id of the selected manager and assign it to a variable.
                    let str = response.newEmployeeMgr;
                    let numbers = str.match(/\d+/g);
                    var manager_id = numbers[0];

                    // Returns the role id of the selected role 
                    function queryForRoleID() {
                        return new Promise((resolve, reject) => {
                            db.query(`SELECT id FROM role WHERE title = '${response.newEmployeeRole}'`, (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result.map((row) => row.id));
                                }
                            });
                        });
                    };

                    queryForRoleID()
                        .then((roleID) => {

                            // Run query to add record to database and display results in the console:
                            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager) VALUES ('${response.newEmployeeFirst}', '${response.newEmployeeLast}', ${roleID[0]}, ${manager_id}, '${response.isEmployeeMgr}')`, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {

                                    console.log(`\n ${response.newEmployeeFirst} ${response.newEmployeeLast} added.\n`);
                                    init();
                                };
                            });
                        });
                });
        });
};

// ***UPDATE EMPLOYEE ROLE*** 
// This function prompts the user to choose an employee and then choose the new role to assign to the employee, and updates the database.
function updateEmployeeRole() {

    // variables to hold arrays to populate menus for 'selectedEmployee' and 'newEmployeeRole' prompts
    var employeesMenu;
    var rolesMenu;

    // Queries the database to return an array containing all employee names (concatenated id, first_name, last_name).
    function employeesQuery() {
        return new Promise((resolve, reject) => {

            // Assign query .sql file to variable
            let sql = fs.readFileSync(`./db/employees_names_query.sql`, 'utf-8');

            db.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {

                    employeesMenu = result.map((row) => row.employees);
                    resolve();
                }
            });
        });
    };

    // Queries the database to return an array containing all role titles.
    function rolesQuery() {
        return new Promise((resolve, reject) => {
            db.query('SELECT title FROM role', (err, result) => {
                if (err) {
                    reject(err);
                } else {

                    rolesMenu = result.map((row) => row.title);
                    resolve()
                }
            });
        });
    };

    // Execute both functions in sequence. Then step user through inputs with prompts.
    employeesQuery()
        .then(() => rolesQuery())
        .then(() => {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Please select the employee you wish to update:',
                        name: 'selectedEmployee',
                        choices: employeesMenu,
                    },
                    {
                        type: 'list',
                        message: 'Please select a role:',
                        name: 'newEmployeeRole',
                        choices: rolesMenu,
                    },
                ])
                .then((response) => {

                    // Get the employee id of from selected employee string and assign it to a variable for use in the database query.
                    let str = response.selectedEmployee;
                    let numbers = str.match(/\d+/g);
                    var employee_id = numbers[0];

                    // Remove the employee id from the selected employee string and assign it to a variable for use in the console.log success message.
                    var employee_name = str.replace(/[0-9]/g, '');

                    // Returns the role id of the selected role 
                    function queryForRoleID() {
                        return new Promise((resolve, reject) => {
                            db.query(`SELECT id FROM role WHERE title = '${response.newEmployeeRole}'`, (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result.map((row) => row.id));
                                }
                            });
                        });
                    };

                    queryForRoleID()
                        .then((roleID) => {

                            // Run query to update the database and display results in the console:
                            db.query(`UPDATE employee SET role_id = ${roleID[0]} WHERE id = ${employee_id}`, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {

                                    console.log(`\n ${employee_name} changed to ${response.newEmployeeRole}.\n`);
                                    init();
                                };
                            });
                        });
                });
        });
};

// ***UPDATE EMPLOYEE MANAGER*** 
// This function prompts the user to choose an employee and then choose the new role to assign to the employee, and updates the database.
function updateEmployeeMgr() {

    // variables to hold arrays to populate menus for 'selectedEmployee' and 'newEmployeeMgr' prompts
    var employeesMenu;
    var managersMenu;

    // Queries the database to return an array containing all employee names (concatenated id, first_name, last_name).
    function employeesQuery() {
        return new Promise((resolve, reject) => {

            // Assign query .sql file to variable
            let sql = fs.readFileSync(`./db/employees_names_query.sql`, 'utf-8');

            db.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    // Define a variable that will hold the employee names pulled from the database. This will be used to populate the selection menu for the employee selection prompt.
                    employeesMenu = result.map((row) => row.employees);
                    resolve();
                }
            });
        });
    };

    // Queries the database to return an array containing all manager names (concatenated manager_id, first_name, last_name).
    function managersQuery() {
        return new Promise((resolve, reject) => {

            // Assign query .sql file to variable
            let sql = fs.readFileSync(`./db/managers_query.sql`, 'utf-8');

            db.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {

                    managersMenu = result.map((row) => row.managers);
                    resolve();
                }
            });
        });
    };

    // Execute both functions in sequence. Then step user through inputs with prompts.
    employeesQuery()
        .then(() => managersQuery())
        .then(() => {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Please select the employee you wish to update:',
                        name: 'selectedEmployee',
                        choices: employeesMenu,
                    },
                    {
                        type: 'list',
                        message: 'Please select a manager for the employee:',
                        name: 'newEmployeeMgr',
                        choices: managersMenu,
                    },
                ])
                .then((response) => {

                    // Get the employee id and manager id of from selected employee and manager strings and assign them to variables for use in the database query.
                    let strEmployee = response.selectedEmployee;
                    let numbersEmployee = strEmployee.match(/\d+/g);
                    var employee_id = numbersEmployee[0];
                    let strMgr = response.newEmployeeMgr;
                    let numbersMgr = strMgr.match(/\d+/g);
                    var manager_id = numbersMgr[0];

                    // Remove the employee id and manager id from the selected employee and manager strings and assign them to variables for use in the console.log success message.
                    var employee_name = strEmployee.replace(/[0-9]/g, '');
                    var manager_name = strMgr.replace(/[0-9]/g, '');

                    // Run query to update the database and display results in the console:
                    db.query(`UPDATE employee SET manager_id = ${manager_id} WHERE id = ${employee_id}`, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {

                            console.log(`\n ${manager_name} is now the manager for ${employee_name}.\n`);
                            init();
                        };
                    });
                });
        });
};

// ***DELETE A ROLE*** 
// This function prompts the user to choose a role to delete from the database. All users assigned to the role are changed to the "-unassigned-" role.
function deleteRole() {

    // variable to hold array to populate menu for 'selectedRole' prompt
    var rolesMenu;

    // Assign query .sql file to variable
    let sql = fs.readFileSync(`./db/role_titles_query.sql`, 'utf-8');

    // Queries the database to return an array containing all role titles.
    function rolesQuery() {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {

                    rolesMenu = result.map((row) => row.title);
                    resolve()
                }
            });
        });
    };

    rolesQuery()
        .then(() => {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Please select a role for deletion:',
                        name: 'selectedRole',
                        choices: rolesMenu,
                    },
                ])
                .then((response) => {

                    var selectedRole = response.selectedRole;

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: `Are you sure you want to delete the ${selectedRole} role? (impacted employees will be assigned to the -unassigned- role)`,
                                name: 'selection',
                                choices: ['No',
                                    'Yes']
                            },
                        ])
                        .then((result) => {
                            if (result.selection == 'No') {
                                init();
                            } else {

                                var roleIDToBeDeleted;

                                function getRoleID() {
                                    return new Promise((resolve, reject) => {
                                        db.query(`SELECT id FROM role WHERE title = '${selectedRole}'`, (err, result) => {
                                            if (err) {
                                                reject(err);
                                            } else {

                                                roleIDToBeDeleted = result.map((row) => row.id);
                                                resolve()
                                            }
                                        });
                                    });
                                };
                            }


                            getRoleID()
                                .then(() => {

                                    // Queries the database to update the employee records containing the role_id with the "-unassigned-" role.
                                    function updateAffectedEmployees() {
                                        return new Promise((resolve, reject) => {
                                            db.query(`UPDATE employee SET role_id = 1 WHERE role_id = '${roleIDToBeDeleted[0]}'`, (err, result) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve()
                                                }
                                            });
                                        });
                                    };

                                    updateAffectedEmployees()
                                        .then(() => {

                                            // Queries the database to delete the role.
                                            db.query(`DELETE from role WHERE title = '${selectedRole}'`, (err, result) => {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    // Insert blank line before result for better readability
                                                    console.log(`\n ${selectedRole} role deleted.\n`);
                                                    init();
                                                };
                                            });

                                        });


                                });
                        });
                });
        });
};

// ***DELETE AN EMPLOYEE*** 
// This function prompts the user to choose an employee to delete from the database.
function deleteEmployee() {

    // variable to hold array to populate menu for 'selectedEmployee' prompt
    var employeesMenu;

    // Queries the database to return an array containing all employee names (concatenated id, first_name, last_name).
    function employeesQuery() {
        return new Promise((resolve, reject) => {

            // Assign query .sql file to variable
            let sql = fs.readFileSync(`./db/employees_names_query.sql`, 'utf-8');

            db.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    
                    employeesMenu = result.map((row) => row.employees);
                    resolve();
                }
            });
        });
    };

    employeesQuery()
        .then(() => {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Please select an employee for deletion:',
                        name: 'selectedEmployee',
                        choices: employeesMenu,
                    },
                ])
                .then((response) => {

                    var selectedEmployee = response.selectedEmployee;

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: `Are you sure you want to delete ${selectedEmployee}?`,
                                name: 'selection',
                                choices: ['No',
                                    'Yes']
                            },
                        ])
                        .then((result) => {

                            if (result.selection == 'No') {
                                init();
                            } else {

                                // Get the employee id from selected employee string and assign to variable for use in the database query.
                                let numbersEmployee = selectedEmployee.match(/\d+/g);
                                var employee_id = numbersEmployee[0];

                                // Run query to delete employee from database.
                                db.query(`DELETE from employee WHERE id = ${employee_id}`, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        
                                        console.log(`\n ${selectedEmployee} deleted.\n`);
                                        init();
                                    };
                                });

                            }


                        });
                });
        });
};


// ***DELETE A DEPARTMENT*** 
// This function prompts the user to choose a department to delete from the database. All users assigned to the department are changed to the "-unassigned-" role.
function deleteDepartment() {

    // variable to hold array to populate menu for 'selectedDept' prompt
    var departmentsMenu;

    // Queries the database to return an array containing all department names.
    function departmentsQuery() {
        return new Promise((resolve, reject) => {

            db.query('SELECT name FROM department', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    
                    departmentsMenu = result.map((row) => row.name);
                    resolve();
                }
            });
        });
    };


    departmentsQuery()
        .then(() => {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Please select a department for deletion:',
                        name: 'selectedDept',
                        choices: departmentsMenu,
                    },
                ])
                .then((response) => {

                    var selectedDept = response.selectedDept;

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: `Are you sure you want to delete the ${selectedDept} department? (impacted employees will be assigned to the -unassigned- role)`,
                                name: 'selection',
                                choices: ['No',
                                    'Yes']
                            },
                        ])
                        .then((result) => {
                            if (result.selection == 'No') {
                                init();
                            } else {

                                var deptIDToBeDeleted;

                                // Queries the database to return the id of the department to be deleted.
                                function getDeptID() {
                                    return new Promise((resolve, reject) => {
                                        db.query(`SELECT id FROM department WHERE name = '${selectedDept}'`, (err, result) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                deptIDToBeDeleted = result.map((row) => row.id);
                                                resolve()
                                            }
                                        });
                                    });
                                };
                            }

                            getDeptID()
                                .then(() => {

                                    // Queries the database to change the role of all affected employees to the "-unassigned-" role.
                                    function updateAffectedEmployees() {
                                        return new Promise((resolve, reject) => {
                                            db.query(`UPDATE employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id SET employee.role_id = 1 WHERE role.department_id = ${deptIDToBeDeleted[0]}`, (err, result) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve()
                                                }
                                            });
                                        });
                                    };

                                    updateAffectedEmployees()
                                        .then(() => {

                                            // Queries the database to delete the department and any associated roles.
                                            db.query(`DELETE FROM department WHERE id = ${deptIDToBeDeleted[0]}`, (err, result) => {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    
                                                    console.log(`\n ${selectedDept} department deleted.\n`);
                                                    init();
                                                };
                                            });

                                        });


                                });
                        });
                });
        });
};

// ***BUDGET VIEW OPTIONS SUB-MENU***
// This function provides the menu options under the View Budget Options selection.
function budgetSubmenu() {
    console.log('\n------------------BUDGET VIEW OPTIONS--------------------\n');

    // Inquirer prompts:
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'Please select an option:',
                name: 'budgetSelection',
                choices: [
                    'View Total Budget',
                    'View Department Budgets',
                    'Return to Main Menu'
                ]
            }
        ])
        .then((response) => {

            // Execute function based on selection.
            switch (response.budgetSelection) {
                case 'View Total Budget':
                    runQuery('total_budget_query.sql', callbackTable);
                    break;
                case 'View Department Budgets':
                    runQuery('budget_by_dept_query.sql', callbackTable);
                    break;
                case 'Return to Main Menu':
                    init();
                    break;
                default:
                    console.log(`no selection`);
            };
        });

};

// ***DELETE OPTIONS SUB-MENU***
// This function provides the menu options under the Delete Options selection.
function deleteSubmenu() {
    console.log('\n------------------DELETE OPTIONS--------------------\n');

    // Inquirer prompts:
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'Please select an option:',
                name: 'deleteSelection',
                choices: [
                    'Delete a Department...',
                    'Delete a Role...',
                    'Delete an Employee...',
                    'Return to Main Menu'
                ]
            }
        ])
        .then((response) => {

            // Execute function based on selection.
            switch (response.deleteSelection) {
                case 'Delete a Department...':
                    deleteDepartment();
                    break;
                case 'Delete a Role...':
                    deleteRole();
                    break;
                case 'Delete an Employee...':
                    deleteEmployee();
                    break;
                case 'Return to Main Menu':
                    init();
                    break;
                default:
                    console.log(`no selection`);
            };
        });

};

// This function handles the Main Menu functionality.
function init() {
    console.log('\n---------------------MAIN MENU----------------------\n');

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
                    'View Employees by Manager',
                    'View Employees by Department',
                    'Add a Department...',
                    'Add a Role...',
                    'Add an Employee...',
                    'Update an Employee Role...',
                    'Change Employee Manager...',
                    'Delete Options...',
                    'Budget View Options...'
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
                case 'View Employees by Manager':
                    runQuery('employees_query_by_mgr.sql', callbackTable);
                    break;
                case 'View Employees by Department':
                    runQuery('employees_query_by_dept.sql', callbackTable);
                    break;
                case 'Add a Department...':
                    addDept();
                    break;
                case 'Add a Role...':
                    addRole();
                    break;
                case 'Add an Employee...':
                    addEmployee();
                    break;
                case 'Update an Employee Role...':
                    updateEmployeeRole();
                    break;
                case 'Change Employee Manager...':
                    updateEmployeeMgr();
                    break;
                case 'Delete Options...':
                    deleteSubmenu();
                    break;
                case 'Budget View Options...':
                    budgetSubmenu();
                    break;
                default:
                    console.log(`no selection`);
            };
        });

};

// Program launch
console.log('******************EMPLOYEE TRACKER******************');
init();



