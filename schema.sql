
CREATE TABLE IF NOT EXISTS contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phoneNumber VARCHAR(50),
  email VARCHAR(255),
  linkedId INT NULL,
  linkPrecedence ENUM('primary', 'secondary') NOT NULL DEFAULT 'primary',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phoneNumber),
  INDEX idx_linked (linkedId)
);
