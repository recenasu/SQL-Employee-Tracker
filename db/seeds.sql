INSERT INTO department (name)
VALUES  ("-unassigned-"),
        ("Supply"),
        ("Engineering"),
        ("Operations"),
        ("Administration");

INSERT INTO role (title, salary, department_id)
VALUES  ("-unassigned-", 0, 1),
        ("M Engineer 1", 30000, 3),
        ("M Engineer 2", 45000, 3),
        ("SW Engineer 1", 30000, 3),
        ("SW Engineer 2", 45000, 3),
        ("Engineer Mgr", 65000, 3),
        ("Admin Assist 1", 25000, 5),
        ("Admin Assist 2", 35000, 5),
        ("Administrator Sr", 50000, 5),
        ("Plant Supervisor", 65000, 4),
        ("Logistics Spec 1", 25000, 2),
        ("Logistics Spec 2", 38000, 2),
        ("Supply Dept Head", 55000, 2),
        ("Shift Operator 1", 30000, 4),
        ("Shift Operator 2", 40000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager)
VALUES  ("- none", "-", null, "-", "Yes"),
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