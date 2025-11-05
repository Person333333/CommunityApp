
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT,
  audience TEXT,
  services TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT 0,
  is_approved BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_is_featured ON resources(is_featured);
CREATE INDEX idx_resources_is_approved ON resources(is_approved);

CREATE TABLE resource_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_status ON resource_submissions(status);
