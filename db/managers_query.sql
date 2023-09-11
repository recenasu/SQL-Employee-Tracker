SELECT CONCAT(id, ' ', first_name, ' ', last_name) AS managers
FROM employee
WHERE is_manager = 'Yes';