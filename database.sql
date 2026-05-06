-- Legal Case Management System Database Script
-- Run this in phpMyAdmin or MySQL CLI after creating the XAMPP database server.

CREATE DATABASE IF NOT EXISTS legal_system CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE legal_system;

DROP TABLE IF EXISTS case_logs;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS lawyers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','staff','lawyer') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE lawyers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  specialization VARCHAR(100) DEFAULT NULL,
  active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(150) NOT NULL,
  contact_info VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  case_type ENUM('Urgent','Regular') NOT NULL DEFAULT 'Regular',
  assigned_lawyer_id INT DEFAULT NULL,
  notes TEXT,
  status ENUM('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_lawyer_id) REFERENCES lawyers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE case_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Sample users
INSERT INTO users (name, email, password, role)
VALUES
('Admin User','admin@lawfirm.local','$2y$10$KIXnH6ibxSHs5SRtY8NcKeoqoQX5wA9t8KXcR6ayRkVjZ3Z4VXb0e','admin'),
('Staff Member','staff@lawfirm.local','$2y$10$RjUDUYH2fAL6C5a0KvSjCO1tIlsJw81Up3G5B1l5vL3bFfsxw6f4G','staff'),
('Lawyer One','lawyer1@lawfirm.local','$2y$10$B2rRX5Y3ofZ2C1.lVtEGQuF1Gd/N4eJBe4hzMVzQnO0zu21BuFb7i','lawyer'),
('Lawyer Two','lawyer2@lawfirm.local','$2y$10$qL7g9j5d8uLJz0wYcVF9GONkA/pj/92rg0tSzNIG1gF9QWywR9eK6','lawyer');

-- Sample lawyers
INSERT INTO lawyers (user_id, phone, specialization)
VALUES
(3, '555-0123', 'Family Law'),
(4, '555-0456', 'Corporate Law');

-- Sample appointments
INSERT INTO appointments (client_name, contact_info, date, time_start, time_end, case_type, assigned_lawyer_id, notes, created_by)
VALUES
('Arthur Dent','arthur@example.com','2026-05-12','09:00:00','10:00:00','Regular',1,'Review contract terms',2),
('Trillian Astra','trillian@example.com','2026-05-12','10:30:00','11:30:00','Urgent',2,'Domestic violence hearing preparation',2),
('Ford Prefect','ford@example.com','2026-05-13','14:00:00','15:00:00','Regular',1,'Corporate merger documents',2),
('Zaphod Beeblebrox','zaphod@example.com','2026-05-13','15:00:00','16:00:00','Urgent',2,'Emergency injunction review',2);

-- Sample case logs
INSERT INTO case_logs (appointment_id, user_id, action, details)
VALUES
(1,2,'Created appointment','Scheduled regular contract meeting.'),
(2,2,'Created appointment','Urgent family law case added.'),
(3,2,'Created appointment','Corporate appointment created for Ford Prefect.'),
(4,2,'Created appointment','Emergency case added for Zaphod Beeblebrox.');
