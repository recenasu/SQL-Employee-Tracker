SELECT SUM(role.salary) AS 'Total Budget'
FROM employee
JOIN role ON employee.role_id = role.id;