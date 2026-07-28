-- Essential Schema for NexMart Admin Dashboard
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fcpjvcburzwghflkongu/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo TEXT,
  owner_id UUID NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  default_locale VARCHAR(10) DEFAULT 'fr',
  ice TEXT,
  if_number TEXT,
  legal_address TEXT,
  legal_name TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar TEXT,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'USER',
  email_verified BOOLEAN DEFAULT false,
  verify_token TEXT,
  reset_token TEXT,
  reset_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locale VARCHAR(10) DEFAULT 'fr'
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  category_id UUID NOT NULL REFERENCES categories(id),
  images TEXT[] NOT NULL,
  tags TEXT[] NOT NULL,
  sku VARCHAR(255) NOT NULL,
  stock INTEGER DEFAULT 0,
  low_stock_at INTEGER DEFAULT 5,
  weight DECIMAL(10,2),
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, sku),
  UNIQUE(organization_id, slug)
);

-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  regular_price DECIMAL(10,2) NOT NULL,
  bundle_price DECIMAL(10,2) NOT NULL,
  discount INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Create bundle_products table
CREATE TABLE IF NOT EXISTS bundle_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(bundle_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_organization_id ON categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_bundles_organization_id ON bundles(organization_id);
CREATE INDEX IF NOT EXISTS idx_bundle_products_bundle_id ON bundle_products(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_products_product_id ON bundle_products(product_id);

-- Insert sample organization
INSERT INTO organizations (id, name, slug, owner_id, default_locale) VALUES
  ('00000000-0000-0000-0000-000000000001', 'NexMart', 'nexmart', '00000000-0000-0000-0000-000000000001', 'fr')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user (password: Admin@123456 - you should hash this properly)
INSERT INTO users (id, email, name, password, role, email_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@nexmart.com', 'Admin User', '$2a$10$YourHashedPasswordHere', 'ADMIN', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample category
INSERT INTO categories (organization_id, name, slug, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Beauty', 'beauty', 'Moroccan beauty products')
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (organization_id, name, slug, description, price, category_id, images, tags, sku, stock, published) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Argan Oil Premium 100ml', 'argan-oil-premium-100ml', 'Premium Moroccan argan oil for hair and skin', 24.99, 
   (SELECT id FROM categories WHERE slug = 'beauty' LIMIT 1),
   ARRAY['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400'],
   ARRAY['beauty', 'oil', 'natural'],
   'ARG-001', 100, true),
  ('00000000-0000-0000-0000-000000000001', 'Rose Water 100ml', 'rose-water-100ml', 'Pure Moroccan rose water toner', 4.99,
   (SELECT id FROM categories WHERE slug = 'beauty' LIMIT 1),
   ARRAY['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400'],
   ARRAY['beauty', 'toner', 'natural'],
   'ROS-001', 150, true),
  ('00000000-0000-0000-0000-000000000001', 'Tagine Pot Traditional', 'tagine-pot-traditional', 'Traditional Moroccan cooking tagine', 35.00,
   (SELECT id FROM categories WHERE slug = 'beauty' LIMIT 1),
   ARRAY['https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=400'],
   ARRAY['cooking', 'traditional', 'moroccan'],
   'TAG-001', 50, true)
ON CONFLICT (organization_id, sku) DO NOTHING;

-- Insert sample bundles
INSERT INTO bundles (organization_id, name, slug, description, image, regular_price, bundle_price, discount, active, sales) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Moroccan Beauty Essentials', 'moroccan-beauty-essentials', 
   'Complete beauty care set with premium argan oil and rose water',
   'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
   64.98, 49.90, 23, true, 240),
  ('00000000-0000-0000-0000-000000000001', 'Home Comfort Set', 'home-comfort-set',
   'Traditional Moroccan home decor collection',
   'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=400',
   544.90, 399.90, 27, true, 87),
  ('00000000-0000-0000-0000-000000000001', 'Luxury Fashion Bundle', 'luxury-fashion-bundle',
   'Premium Moroccan fashion accessories',
   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
   184.80, 129.90, 30, true, 156)
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Link products to bundles
INSERT INTO bundle_products (bundle_id, product_id) VALUES
  ((SELECT id FROM bundles WHERE slug = 'moroccan-beauty-essentials' LIMIT 1), 
   (SELECT id FROM products WHERE sku = 'ARG-001' LIMIT 1)),
  ((SELECT id FROM bundles WHERE slug = 'moroccan-beauty-essentials' LIMIT 1), 
   (SELECT id FROM products WHERE sku = 'ROS-001' LIMIT 1)),
  ((SELECT id FROM bundles WHERE slug = 'moroccan-beauty-essentials' LIMIT 1), 
   (SELECT id FROM products WHERE sku = 'TAG-001' LIMIT 1)),
  ((SELECT id FROM bundles WHERE slug = 'home-comfort-set' LIMIT 1), 
   (SELECT id FROM products WHERE sku = 'TAG-001' LIMIT 1)),
  ((SELECT id FROM bundles WHERE slug = 'luxury-fashion-bundle' LIMIT 1), 
   (SELECT id FROM products WHERE sku = 'ARG-001' LIMIT 1))
ON CONFLICT (bundle_id, product_id) DO NOTHING;

-- Enable Row Level Security (optional, for security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_products ENABLE ROW LEVEL SECURITY;

-- Create policies (optional - adjust based on your auth setup)
-- This allows read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON organizations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to authenticated users" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to authenticated users" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to authenticated users" ON bundles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to authenticated users" ON bundle_products
  FOR SELECT USING (auth.role() = 'authenticated');
