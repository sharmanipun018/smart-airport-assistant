DROP TABLE IF EXISTS flights;

CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  flight_number VARCHAR(10) NOT NULL UNIQUE,
  airline VARCHAR(60) NOT NULL,
  origin_code CHAR(3) NOT NULL,
  origin_city VARCHAR(60) NOT NULL,
  destination_code CHAR(3) NOT NULL,
  destination_city VARCHAR(60) NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  terminal VARCHAR(20) NOT NULL,
  gate VARCHAR(10) NOT NULL,
  checkin_counters VARCHAR(30),
  boarding_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'On Time'
);

INSERT INTO flights
(flight_number, airline, origin_code, origin_city, destination_code, destination_city,
 departure_time, arrival_time, terminal, gate, checkin_counters, boarding_time, status)
VALUES
('SK101','Skyline Air','DEL','New Delhi','BOM','Mumbai',
 CURRENT_DATE + TIME '10:30', CURRENT_DATE + TIME '12:35','Terminal 3','24','D-12, D-13', CURRENT_DATE + TIME '10:00','On Time'),
('SK202','Skyline Air','DEL','New Delhi','BLR','Bengaluru',
 CURRENT_DATE + TIME '11:15', CURRENT_DATE + TIME '14:00','Terminal 3','18','D-05, D-06', CURRENT_DATE + TIME '10:45','Boarding'),
('IN310','Indus Airways','DEL','New Delhi','CCU','Kolkata',
 CURRENT_DATE + TIME '12:00', CURRENT_DATE + TIME '14:15','Terminal 2','07','B-01, B-02', CURRENT_DATE + TIME '11:30','Delayed'),
('IN415','Indus Airways','DEL','New Delhi','HYD','Hyderabad',
 CURRENT_DATE + TIME '13:20', CURRENT_DATE + TIME '15:35','Terminal 2','09','B-08, B-09', CURRENT_DATE + TIME '12:50','On Time'),
('SK330','Skyline Air','DEL','New Delhi','MAA','Chennai',
 CURRENT_DATE + TIME '14:45', CURRENT_DATE + TIME '17:30','Terminal 3','31','E-03, E-04', CURRENT_DATE + TIME '14:15','On Time'),
('GA512','Gangetic Airlines','DEL','New Delhi','GOI','Goa',
 CURRENT_DATE + TIME '16:10', CURRENT_DATE + TIME '18:40','Terminal 1','03','A-02, A-03', CURRENT_DATE + TIME '15:40','Cancelled'),
('GA620','Gangetic Airlines','DEL','New Delhi','JAI','Jaipur',
 CURRENT_DATE + TIME '17:30', CURRENT_DATE + TIME '18:30','Terminal 1','05','A-06', CURRENT_DATE + TIME '17:00','On Time'),
('SK415','Skyline Air','DEL','New Delhi','BOM','Mumbai',
 CURRENT_DATE + TIME '19:00', CURRENT_DATE + TIME '21:05','Terminal 3','26','D-14, D-15', CURRENT_DATE + TIME '18:30','On Time');