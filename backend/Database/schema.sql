CREATE DATABASE IF NOT EXISTS canteen_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE canteen_tracker;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  worker_type ENUM('dorm', 'non_dorm', 'dorm_outside_province') NOT NULL,
  left_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meal_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  meal_date DATE NOT NULL,
  meal_slot ENUM('morning', 'afternoon', 'evening') NOT NULL,
  worker_type ENUM('dorm', 'non_dorm', 'dorm_outside_province') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_meal_records_worker
    FOREIGN KEY (worker_id) REFERENCES workers(id),
  CONSTRAINT uq_meal_once
    UNIQUE (worker_id, meal_date, meal_slot)
);

CREATE TABLE IF NOT EXISTS daily_coupon_counts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  count_date DATE NOT NULL UNIQUE,
  coupon_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_coupon_count CHECK (coupon_count >= 0)
);