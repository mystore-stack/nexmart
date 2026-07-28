import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabase() {
  console.log('Setting up Supabase database...');
  
  try {
    // Create organization
    console.log('Creating organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'NexMart',
        slug: 'nexmart',
        owner_id: '00000000-0000-0000-0000-000000000001',
        default_locale: 'fr'
      }, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (orgError) {
      console.error('Error creating organization:', orgError);
    } else {
      console.log('✓ Organization created:', org.name);
    }
    
    // Create category
    console.log('Creating category...');
    const { data: category, error: catError } = await supabase
      .from('categories')
      .upsert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: 'Beauty',
        slug: 'beauty',
        description: 'Moroccan beauty products'
      }, {
        onConflict: 'organization_id,slug'
      })
      .select()
      .single();
    
    if (catError) {
      console.error('Error creating category:', catError);
    } else {
      console.log('✓ Category created:', category.name);
    }
    
    // Create products
    console.log('Creating products...');
    const products = [
      {
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: 'Argan Oil Premium 100ml',
        slug: 'argan-oil-premium-100ml',
        description: 'Premium Moroccan argan oil for hair and skin',
        price: 24.99,
        category_id: category.id,
        images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400'],
        tags: ['beauty', 'oil', 'natural'],
        sku: 'ARG-001',
        stock: 100,
        published: true
      },
      {
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: 'Rose Water 100ml',
        slug: 'rose-water-100ml',
        description: 'Pure Moroccan rose water toner',
        price: 4.99,
        category_id: category.id,
        images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400'],
        tags: ['beauty', 'toner', 'natural'],
        sku: 'ROS-001',
        stock: 150,
        published: true
      },
      {
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: 'Tagine Pot Traditional',
        slug: 'tagine-pot-traditional',
        description: 'Traditional Moroccan cooking tagine',
        price: 35.00,
        category_id: category.id,
        images: ['https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=400'],
        tags: ['cooking', 'traditional', 'moroccan'],
        sku: 'TAG-001',
        stock: 50,
        published: true
      }
    ];
    
    for (const product of products) {
      const { data: prod, error: prodError } = await supabase
        .from('products')
        .upsert(product, {
          onConflict: 'organization_id,sku'
        })
        .select()
        .single();
      
      if (prodError) {
        console.error('Error creating product:', product.name, prodError);
      } else {
        console.log('✓ Product created:', prod.name);
      }
    }
    
    // Create bundles
    console.log('Creating bundles...');
    const bundles = [
      {
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: 'Moroccan Beauty Essentials',
        slug: 'moroccan-beauty-essentials',
        description: 'Complete beauty care set with premium argan oil and rose water',
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
        regular_price: 64.98,
        bundle_price: 49.90,
        discount: 23,
        active: true,
        sales: 240
      },
      {
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: 'Home Comfort Set',
        slug: 'home-comfort-set',
        description: 'Traditional Moroccan home decor collection',
        image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=400',
        regular_price: 544.90,
        bundle_price: 399.90,
        discount: 27,
        active: true,
        sales: 87
      },
      {
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: 'Luxury Fashion Bundle',
        slug: 'luxury-fashion-bundle',
        description: 'Premium Moroccan fashion accessories',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
        regular_price: 184.80,
        bundle_price: 129.90,
        discount: 30,
        active: true,
        sales: 156
      }
    ];
    
    const createdBundles = [];
    for (const bundle of bundles) {
      const { data: bun, error: bunError } = await supabase
        .from('bundles')
        .upsert(bundle, {
          onConflict: 'organization_id,slug'
        })
        .select()
        .single();
      
      if (bunError) {
        console.error('Error creating bundle:', bundle.name, bunError);
      } else {
        console.log('✓ Bundle created:', bun.name);
        createdBundles.push(bun);
      }
    }
    
    // Link products to bundles
    console.log('Linking products to bundles...');
    const bundleProducts = [
      { bundle_slug: 'moroccan-beauty-essentials', product_sku: 'ARG-001' },
      { bundle_slug: 'moroccan-beauty-essentials', product_sku: 'ROS-001' },
      { bundle_slug: 'moroccan-beauty-essentials', product_sku: 'TAG-001' },
      { bundle_slug: 'home-comfort-set', product_sku: 'TAG-001' },
      { bundle_slug: 'luxury-fashion-bundle', product_sku: 'ARG-001' }
    ];
    
    for (const link of bundleProducts) {
      const { data: bundle } = await supabase
        .from('bundles')
        .select('id')
        .eq('slug', link.bundle_slug)
        .single();
      
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('sku', link.product_sku)
        .single();
      
      if (bundle && product) {
        const { error: linkError } = await supabase
          .from('bundle_products')
          .upsert({
            bundle_id: bundle.id,
            product_id: product.id
          }, {
            onConflict: 'bundle_id,product_id'
          });
        
        if (linkError) {
          console.error('Error linking products:', linkError);
        } else {
          console.log(`✓ Linked ${link.product_sku} to ${link.bundle_slug}`);
        }
      }
    }
    
    console.log('\n✅ Setup completed successfully!');
    console.log('You can now test the admin dashboard at http://localhost:3000/admin/bundles');
    
  } catch (error) {
    console.error('Setup failed:', error);
    console.log('\nNote: If tables do not exist, please run the SQL script in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/fcpjvcburzwghflkongu/sql');
    console.log('Copy the content from supabase-full-schema.sql and run it.');
  }
}

setupSupabase();
