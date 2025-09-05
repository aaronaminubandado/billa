
#Wallets Table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  color TEXT,
  icon TEXT,
  include_in_total BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


#Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  wallet_id UUID REFERENCES wallets(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);