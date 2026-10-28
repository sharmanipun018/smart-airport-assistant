DROP TABLE IF EXISTS facilities;

CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(30) NOT NULL,
  terminal VARCHAR(20) NOT NULL,
  floor VARCHAR(20) NOT NULL,
  description VARCHAR(200),
  x INTEGER NOT NULL CHECK (x BETWEEN 0 AND 100),
  y INTEGER NOT NULL CHECK (y BETWEEN 0 AND 100)
);

INSERT INTO facilities (name, category, terminal, floor, description, x, y) VALUES
('Entrance Hall', 'Entrance', 'Terminal 3', 'Level 2', 'Main entrance to the departures area', 20, 85),
('Security Check', 'Security', 'Terminal 3', 'Level 2', 'Passenger and baggage screening', 45, 60),
('Information Desk', 'Information Desk', 'Terminal 3', 'Level 2', 'Help with flights, directions and announcements', 30, 75),
('Gate 18', 'Gate', 'Terminal 3', 'Level 2', 'Boarding gate 18', 70, 20),
('Gate 24', 'Gate', 'Terminal 3', 'Level 2', 'Boarding gate 24', 55, 12),
('Gate 26', 'Gate', 'Terminal 3', 'Level 2', 'Boarding gate 26', 62, 12),
('Gate 31', 'Gate', 'Terminal 3', 'Level 2', 'Boarding gate 31', 80, 25),
('Washroom A', 'Washroom', 'Terminal 3', 'Level 2', 'Near the food court, wheelchair accessible', 58, 38),
('Washroom B', 'Washroom', 'Terminal 3', 'Level 2', 'Near Gate 31', 78, 35),
('Food Court', 'Restaurant', 'Terminal 3', 'Level 2', 'Cafes, snacks and meals', 62, 45),
('Cloud Cafe', 'Restaurant', 'Terminal 3', 'Level 2', 'Coffee, tea and light bites', 72, 50),
('Drinking Water Point 1', 'Drinking Water', 'Terminal 3', 'Level 2', 'Free filtered water near the food court', 52, 42),
('Medical Assistance Room', 'Medical', 'Terminal 3', 'Level 2', 'First aid and medical help, open 24 hours', 38, 50),
('Sky Lounge', 'Lounge', 'Terminal 3', 'Level 2', 'Seating, charging points and refreshments', 82, 55),
('Duty Free Shop', 'Shop', 'Terminal 3', 'Level 2', 'Perfumes, chocolates and travel items', 50, 28),
('Baggage Claim 1', 'Baggage', 'Terminal 3', 'Level 1', 'Arrivals baggage belt 1', 40, 70),
('Information Desk T2', 'Information Desk', 'Terminal 2', 'Level 1', 'Help desk for Terminal 2', 30, 60),
('Washroom T2', 'Washroom', 'Terminal 2', 'Level 1', 'Near Gate 7', 55, 40),
('Gate 7', 'Gate', 'Terminal 2', 'Level 1', 'Boarding gate 7', 60, 20),
('Gate 9', 'Gate', 'Terminal 2', 'Level 1', 'Boarding gate 9', 70, 20),
('Gate 3', 'Gate', 'Terminal 1', 'Level 1', 'Boarding gate 3', 50, 20),
('Gate 5', 'Gate', 'Terminal 1', 'Level 1', 'Boarding gate 5', 60, 20);