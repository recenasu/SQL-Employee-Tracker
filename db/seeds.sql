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

INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager)
VALUES  ("- none", "-", null, "-", "No"),
        ("John", "Johnston", 2, 4, "No"),
        ("Joe", "Johnston", 1, 4, "No"),
        ("Jimmy", "Johnston", 5, 1, "Yes"),
        ("Jackie", "Johnston", 3, 4, "No"),
        ("Jennifer", "Johnston", 4, 4, "No"),
        ("Han", "Solo", 9, 1, "Yes"),
        ("Luke", "Skywalker", 13, 7, "No"),
        ("Leia", "Organa", 10, 10, "No"),
        ("Ben", "Kenobi", 12, 1, "Yes"),
        ("Wedge", "Antilles", 14, 7, "No");