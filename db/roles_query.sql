SELECT role.id AS ID, role.title AS Title, role.salary AS Salary, department.name AS Dept 
FROM department
JOIN role ON department.id = role.department_id
WHERE role.title != '-unassigned-'
ORDER BY role.id;