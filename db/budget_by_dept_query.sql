SELECT department.name AS Department, SUM(role.salary) AS 'Dept Budget'
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department on role.department_id = department.id
WHERE department.name != '-unassigned-'
GROUP BY department.name;