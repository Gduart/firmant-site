CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  customerName TEXT NOT NULL,
  customerEmail TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  customerCompany TEXT,
  customerCpfCnpj TEXT,
  serviceSnapshot TEXT NOT NULL,
  billingModel TEXT NOT NULL,
  paymentMethodPreference TEXT NOT NULL,
  oneTimeAmount REAL NOT NULL,
  recurringAmount REAL NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  externalReference TEXT NOT NULL UNIQUE,
  asaasCustomerId TEXT,
  asaasPaymentId TEXT,
  asaasCheckoutId TEXT,
  asaasSubscriptionId TEXT,
  checkoutUrl TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders (asaasPaymentId);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_id ON orders (asaasCheckoutId);
CREATE INDEX IF NOT EXISTS idx_orders_subscription_id ON orders (asaasSubscriptionId);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerPaymentId TEXT NOT NULL UNIQUE,
  providerStatus TEXT,
  billingType TEXT,
  amount REAL NOT NULL,
  dueDate TEXT,
  paidAt TEXT,
  invoiceUrl TEXT,
  bankSlipUrl TEXT,
  pixQrCode TEXT,
  pixPayload TEXT,
  rawPayload TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders (id)
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (orderId);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  providerSubscriptionId TEXT NOT NULL UNIQUE,
  cycle TEXT,
  value REAL NOT NULL,
  nextDueDate TEXT,
  status TEXT,
  billingType TEXT,
  rawPayload TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders (id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON subscriptions (orderId);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  providerEventId TEXT NOT NULL UNIQUE,
  eventType TEXT NOT NULL,
  receivedAt TEXT NOT NULL,
  processedAt TEXT,
  isDuplicate INTEGER NOT NULL DEFAULT 0,
  payload TEXT NOT NULL,
  processingResult TEXT
);
