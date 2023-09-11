SELECT CONCAT(id, ' ', first_name, ' ', last_name) AS employees
FROM employee
WHERE role_id IS NOT NULL