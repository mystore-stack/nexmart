// mobile/src/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Search, ChevronRight } from 'lucide-react-native';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { Product } from '../types';
import { productsAPI } from '../api/products';
import { Colors, Spacing, Radius, Shadows } from '../theme';

interface SearchScreenProps {
  onBack: () => void;
  onProductPress: (product: Product) => void;
  onLoginPress: () => void;
}

const DEFAULT_SUGGESTIONS = [
  'iphone 15 pro max',
  'iphone 15',
  'iphone 14',
  'iphone 13',
  'iphone 12',
  'iphone accessoires',
];

const SUGGESTED_PRODUCTS_MOCK = [
  {
    id: 'sug-1',
    name: 'iPhone 15 Pro Max',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300',
  },
  {
    id: 'sug-2',
    name: 'iPhone 14',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=300',
  },
  {
    id: 'sug-3',
    name: 'Coque iPhone Silicone',
    price: 199,
    image: 'https://images.unsplash.com/photo-1601593378440-62f7902d338e?w=300',
  },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, onProductPress, onLoginPress }) => {
  const [query, setQuery] = useState('iphone');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await productsAPI.getProducts({ q: query.trim(), limit: 20 });
        setResults(res.products);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View style={styles.container}>
      {/* Top Search Bar Row matching Photo #5 */}
      <View style={styles.searchHeader}>
        <View style={styles.inputContainer}>
          <Search size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Rechercher..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Query Suggestions */}
        <View style={styles.suggestionsList}>
          {DEFAULT_SUGGESTIONS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionRow}
              onPress={() => setQuery(item)}
            >
              <Search size={16} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested Products Section */}
        <View style={styles.suggestedSection}>
          <Text style={styles.sectionTitle}>Produits suggérés</Text>

          {SUGGESTED_PRODUCTS_MOCK.map((prod) => (
            <TouchableOpacity
              key={prod.id}
              style={styles.suggestedCard}
              activeOpacity={0.8}
              onPress={() => {
                if (results.length > 0) {
                  onProductPress(results[0]);
                }
              }}
            >
              <Image source={{ uri: prod.image }} style={styles.suggestedImage} resizeMode="contain" />
              <View style={styles.suggestedInfo}>
                <Text style={styles.suggestedName}>{prod.name}</Text>
                <Text style={styles.suggestedPrice}>{prod.price} DH</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Real Results if Available */}
        {isLoading && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}

        {!isLoading && results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultCountTitle}>Résultats pour "{query}"</Text>
            <View style={styles.grid}>
              {results.map((product) => (
                <ProductCard key={product.id} product={product} onPress={() => onProductPress(product)} onLoginPress={onLoginPress} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm + 2,
    height: 42,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.navy,
  },
  cancelButton: {
    marginLeft: Spacing.md,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  suggestionsList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.navy,
  },
  suggestedSection: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: Spacing.sm + 2,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestedImage: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    marginRight: Spacing.md,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 2,
  },
  suggestedPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  loaderBox: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  resultsContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  resultCountTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
