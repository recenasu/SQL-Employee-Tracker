SELECT role.id AS ID, role.title AS Title, role.salary AS Salary, department.name AS Dept 
FROM department
JOIN role ON department.id = role.department_id
ORDER BY role.id;