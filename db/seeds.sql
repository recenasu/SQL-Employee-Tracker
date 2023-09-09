INSERT INTO department (name)
VALUES  ("Supply"),
        ("Engineering"),
        ("Operations"),
        ("Administration");

INSERT INTO role (title, salary, department_id)
VALUES  ("M Engineer 1", 30000, 2),
        ("M Engineer 2", 45000, 2),
        ("SW Engineer 1", 30000, 2),
        ("SW Engineer 2", 45000, 2),
        ("Engineer Mgr", 65000, 2),
        ("Admin Assist 1", 25000, 4),
        ("Admin Assist 2", 35000, 4),
        ("Administrator Sr", 50000, 4),
        ("Plant Supervisor", 65000, 3),
        ("Logistics Spec 1", 25000, 1),
        ("Logistics Spec 2", 38000, 1),
        ("Supply Dept Head", 55000, 1),
        ("Shift Operator 1", 30000, 3),
        ("Shift Operator 2", 40000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("John", "Johnston", 2, 3),
        ("Joe", "Johnston", 1, 3),
        ("Jimmy", "Johnston", 5, null),
        ("Jackie", "Johnston", 3, 3),
        ("Jennifer", "Johnston", 4, 3);