// mobile/src/screens/CategoriesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Header } from '../components/common/Header';
import { ProductCard } from '../components/common/ProductCard';
import { Category, Product } from '../types';
import { productsAPI } from '../api/products';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { ArrowRight, Search } from 'lucide-react-native';

interface CategoriesScreenProps {
  onProductPress: (product: Product) => void;
  onSearchPress: () => void;
  onCartPress: () => void;
  onNotificationPress?: () => void;
  onLoginPress: () => void;
}

const FEATURED_CATEGORIES_MOCK = [
  { id: 'cat-1', name: 'Électroménager', count: '124 produits', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500' },
  { id: 'cat-2', name: 'High-Tech', count: '256 produits', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' },
  { id: 'cat-3', name: 'Maison', count: '189 produits', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
  { id: 'cat-4', name: 'Mode', count: '326 produits', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500' },
  { id: 'cat-5', name: 'Beauté & Santé', count: '142 produits', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500' },
  { id: 'cat-6', name: 'Sport & Loisirs', count: '96 produits', image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=500' },
];

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onProductPress,
  onSearchPress,
  onCartPress,
  onNotificationPress,
  onLoginPress,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const catList = await productsAPI.getCategories();
      setCategories(catList);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPillSelect = async (catSlug: string) => {
    setSelectedCatId(catSlug);
    if (catSlug === 'all') {
      setProducts([]);
      return;
    }
    try {
      const res = await productsAPI.getProducts({ category: catSlug, limit: 20 });
      setProducts(res.products);
    } catch {
      setProducts([]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSearchPress={onSearchPress} onCartPress={onCartPress} onNotificationPress={onNotificationPress} />

      {/* Category Pills Tab Bar */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          <TouchableOpacity
            style={[styles.pill, selectedCatId === 'all' && styles.pillActive]}
            onPress={() => handleCategoryPillSelect('all')}
          >
            <Text style={[styles.pillText, selectedCatId === 'all' && styles.pillTextActive]}>Toutes</Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const isActive = selectedCatId === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => handleCategoryPillSelect(cat.slug)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {selectedCatId !== 'all' && products.length > 0 ? (
          <View style={styles.gridSection}>
            <Text style={styles.sectionTitle}>Produits</Text>
            <View style={styles.productGrid}>
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} onPress={() => onProductPress(prod)} onLoginPress={onLoginPress} />
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Nos Catégories Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nos catégories</Text>
            </View>

            <View style={styles.categoriesGrid}>
              {(categories.length > 0 ? categories : FEATURED_CATEGORIES_MOCK).map((cat, idx) => {
                const mockInfo = FEATURED_CATEGORIES_MOCK[idx % FEATURED_CATEGORIES_MOCK.length];
                const catName = cat.name || mockInfo.name;
                const catImg = (cat as any).image || mockInfo.image;
                const countText = (cat as any).productCount ? `${(cat as any).productCount} produits` : mockInfo.count;

                return (
                  <TouchableOpacity
                    key={cat.id || mockInfo.id}
                    style={styles.categoryCard}
                    activeOpacity={0.85}
                    onPress={() => handleCategoryPillSelect((cat as any).slug || 'all')}
                  >
                    <Image source={{ uri: catImg }} style={styles.categoryCardImage} resizeMode="cover" />
                    <View style={styles.categoryCardInfo}>
                      <Text style={styles.categoryCardName}>{catName}</Text>
                      <Text style={styles.categoryCardCount}>{countText}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Featured Brand Banner */}
            <View style={styles.bannerCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800' }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>Des marques de confiance</Text>
                <Text style={styles.bannerSubtitle}>Découvrez nos meilleures marques</Text>
                <TouchableOpacity style={styles.bannerButton} onPress={onSearchPress}>
                  <Text style={styles.bannerButtonText}>Voir tout</Text>
                  <ArrowRight size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillsContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pillsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs + 2,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navyMuted,
  },
  pillTextActive: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  categoryCardImage: {
    width: '100%',
    height: 110,
    backgroundColor: Colors.surfaceVariant,
  },
  categoryCardInfo: {
    padding: Spacing.sm + 2,
  },
  categoryCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 2,
  },
  categoryCardCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  bannerCard: {
    height: 140,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    position: 'relative',
    ...Shadows.soft,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21, 28, 44, 0.55)',
    padding: Spacing.md,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: Spacing.sm,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  gridSection: {
    marginBottom: Spacing.xl,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
});
