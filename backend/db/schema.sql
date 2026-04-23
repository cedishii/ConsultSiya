CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student', 'professor', 'admin')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  program VARCHAR(100),
  year_level INTEGER
);

CREATE TABLE IF NOT EXISTS professors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  nature_of_advising TEXT,
  mode VARCHAR(10) CHECK (mode IN ('F2F', 'OL')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_details (
  id SERIAL PRIMARY KEY,
  consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE,
  action_taken TEXT,
  referral TEXT,
  remarks TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);