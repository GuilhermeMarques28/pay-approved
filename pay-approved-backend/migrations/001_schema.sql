CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  installments INTEGER NOT NULL CHECK (installments > 0),
  paid_installments INTEGER NOT NULL DEFAULT 0 CHECK (paid_installments >= 0),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  next_due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payment_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_auth_id ON customers(auth_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_cpf ON customers(cpf);
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_next_due_date ON contracts(next_due_date);
CREATE INDEX idx_installments_contract_id ON installments(contract_id);
CREATE INDEX idx_documents_contract_id ON documents(contract_id);
CREATE INDEX idx_payment_alerts_contract_id ON payment_alerts(contract_id);
CREATE INDEX idx_payment_alerts_customer_id ON payment_alerts(customer_id);
CREATE INDEX idx_payment_alerts_status ON payment_alerts(status);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can read their own data"
  ON customers FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Customers can update their own data"
  ON customers FOR UPDATE
  USING (auth.uid() = auth_id);

CREATE POLICY "Customers can insert their own data"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Customers can read their own contracts"
  ON contracts FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Customers can insert their own contracts"
  ON contracts FOR INSERT
  WITH CHECK (customer_id IN (
    SELECT id FROM customers WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Customers can read their own installments"
  ON installments FOR SELECT
  USING (contract_id IN (
    SELECT c.id FROM contracts c
    JOIN customers cu ON c.customer_id = cu.id
    WHERE cu.auth_id = auth.uid()
  ));

CREATE POLICY "Customers can read their own documents"
  ON documents FOR SELECT
  USING (contract_id IN (
    SELECT c.id FROM contracts c
    JOIN customers cu ON c.customer_id = cu.id
    WHERE cu.auth_id = auth.uid()
  ));

CREATE POLICY "Customers can read their own payment alerts"
  ON payment_alerts FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Admins can read all customers"
  ON customers FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_id FROM customers WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can read all contracts"
  ON contracts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT cu.auth_id FROM contracts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all documents"
  ON documents FOR SELECT
  USING (
    auth.uid() IN (
      SELECT cu.auth_id FROM contracts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.role = 'admin'
    )
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT cu.auth_id FROM contracts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all payment alerts"
  ON payment_alerts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT cu.auth_id FROM payment_alerts pa
      JOIN customers cu ON pa.customer_id = cu.id
      WHERE cu.role = 'admin'
    )
  );