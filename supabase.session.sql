-- Create problems table
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tags TEXT [] NOT NULL,
  difficulty INTEGER NOT NULL,
  url TEXT NOT NULL,
  solved INTEGER,
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT NOT NULL,
  added_by_url TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0
);