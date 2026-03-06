/*
  # Complete E-Commerce Database Schema

  ## New Tables
    1. **categories** - Product categories
    2. **sellers** - Seller information
    3. **products** - Product catalog with repair service flag
    4. **customers** - Customer profiles
    5. **carts** - Shopping carts
    6. **cart_items** - Items in carts
    7. **orders** - Customer orders
    8. **order_items** - Items in orders
    9. **reviews** - Product reviews
    10. **payments** - Payment records
    11. **wishlist** - Customer wishlists

  ## Security
    - RLS enabled on all tables
    - Customers can manage their own data
    - Admin access for authenticated users on products and categories
    - Public read access for products and categories
*/

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Sellers Table
CREATE TABLE IF NOT EXISTS sellers (
  seller_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text UNIQUE,
  total_sales numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  seller_id uuid REFERENCES sellers(seller_id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(category_id) ON DELETE SET NULL,
  mrp numeric NOT NULL CHECK (mrp >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  brand text,
  description text,
  image_url text,
  is_repair_service boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  customer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  date_of_birth date,
  age integer,
  address text,
  city text,
  state text,
  postal_code text,
  created_at timestamptz DEFAULT now()
);

-- Carts Table
CREATE TABLE IF NOT EXISTS carts (
  cart_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE UNIQUE,
  grand_total numeric DEFAULT 0 CHECK (grand_total >= 0),
  items_total integer DEFAULT 0 CHECK (items_total >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(cart_id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(product_id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  order_date timestamptz DEFAULT now(),
  shipping_date timestamptz,
  order_amount numeric NOT NULL CHECK (order_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address text,
  created_at timestamptz DEFAULT now()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(product_id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  mrp numeric NOT NULL CHECK (mrp >= 0),
  created_at timestamptz DEFAULT now()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(product_id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, customer_id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  payment_mode text NOT NULL CHECK (payment_mode IN ('credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery')),
  payment_date timestamptz DEFAULT now(),
  amount numeric NOT NULL CHECK (amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products Policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Customers Policies
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create customer profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Carts Policies
CREATE POLICY "Customers can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- Cart Items Policies
CREATE POLICY "Customers can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

-- Orders Policies
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = orders.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = orders.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = orders.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- Order Items Policies
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN customers ON customers.customer_id = orders.customer_id
      WHERE orders.order_id = order_items.order_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN customers ON customers.customer_id = orders.customer_id
      WHERE orders.order_id = order_items.order_id
      AND customers.user_id = auth.uid()
    )
  );

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Customers can create own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- Payments Policies
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = payments.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = payments.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- Wishlist Policies
CREATE POLICY "Customers can view own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = wishlist.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can add to own wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = wishlist.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can remove from own wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = wishlist.customer_id
      AND customers.user_id = auth.uid()
    )
  );
