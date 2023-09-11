SELECT employee.id AS ID, employee.first_name AS `First Name`, employee.last_name AS `Last Name`, role.title AS Title, department.name AS Dept,  role.salary AS Salary, CONCAT(t2.first_name, ' ', t2.last_name) AS Manager
FROM department
JOIN role ON department.id = role.department_id
JOIN employee ON role.id = employee.role_id
JOIN employee t2 ON employee.manager_id = t2.id
ORDER BY employee.id;
