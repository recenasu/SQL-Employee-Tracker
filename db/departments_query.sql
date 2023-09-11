SELECT department.id AS ID, department.name AS Dept
FROM department
WHERE department.name != '-unassigned-';