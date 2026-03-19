-- SnapAttend Database Schema
-- Created for easy setup in MySQL/MariaDB

CREATE DATABASE IF NOT EXISTS snapattend;
USE snapattend;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_admins_username` (`username`),
  KEY `ix_admins_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `roll_number` varchar(50) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `face_encoding` longblob,
  `image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roll_number` (`roll_number`),
  KEY `ix_students_id` (`id`),
  KEY `ix_students_name` (`name`),
  KEY `ix_students_roll_number` (`roll_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Attendance Table
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `confidence_score` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `ix_attendance_id` (`id`),
  KEY `ix_attendance_date` (`date`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Initial Setup Data
-- Default Admin: admin / admin123
INSERT IGNORE INTO `admins` (`username`, `hashed_password`, `full_name`) VALUES 
('admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S.', 'System Administrator');
