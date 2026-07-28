-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
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
  product_id UUID NOT NULL,
  UNIQUE(bundle_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bundles_organization_id ON bundles(organization_id);
CREATE INDEX IF NOT EXISTS idx_bundle_products_bundle_id ON bundle_products(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_products_product_id ON bundle_products(product_id);

-- Insert sample bundles (assuming organization_id exists)
-- You'll need to replace the organization_id with your actual organization ID
INSERT INTO bundles (organization_id, name, slug, description, image, regular_price, bundle_price, discount, active, sales) VALUES
  (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual organization_id
    'Moroccan Beauty Essentials',
    'moroccan-beauty-essentials',
    'Complete beauty care set with premium argan oil and rose water',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
    64.98,
    49.90,
    23,
    true,
    240
  ),
  (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual organization_id
    'Home Comfort Set',
    'home-comfort-set',
    'Traditional Moroccan home decor collection',
    'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=400',
    544.90,
    399.90,
    27,
    true,
    87
  ),
  (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual organization_id
    'Luxury Fashion Bundle',
    'luxury-fashion-bundle',
    'Premium Moroccan fashion accessories',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    184.80,
    129.90,
    30,
    true,
    156
  )
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Enable Row Level Security (optional, for security)
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_products ENABLE ROW LEVEL SECURITY;

-- Create policies (optional - adjust based on your auth setup)
-- This allows read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON bundles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to authenticated users" ON bundle_products
  FOR SELECT USING (auth.role() = 'authenticated');
