TRUNCATE
  terra_pledges,
  RESTART IDENTITY CASCADE;

INSERT INTO terra_pledges (name, location, days)
VALUES
('Mike', 'Florida', 30),
('Marie', 'El Paso', 25),
('Hailey', 'Jacksonville', 25),
('Alyssa', 'Alaska', 21);
