SELECT title 
FROM role
WHERE title != '-unassigned-'
ORDER BY role.id;