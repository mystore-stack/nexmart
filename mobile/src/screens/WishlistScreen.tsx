// mobile/src/screens/WishlistScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Header } from '../components/common/Header';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { Product } from '../types';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { Colors, Spacing } from '../theme';

interface WishlistScreenProps {
  onProductPress: (product: Product) => void;
  onSearchPress: () => void;
  onCartPress: () => void;
  onExplorePress: () => void;
  onLoginPress?: () => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  onProductPress,
  onSearchPress,
  onCartPress,
  onExplorePress,
  onLoginPress,
}) => {
  const { items, error, fetchWishlist } = useWishlistStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [fetchWishlist, isAuthenticated]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header onSearchPress={onSearchPress} onCartPress={onCartPress} />

        <View style={styles.titleBox}>
          <Text style={styles.screenTitle}>Mes Favoris</Text>
        </View>

        <EmptyState
          type="wishlist"
          title="Connectez-vous pour voir vos favoris"
          description="Votre liste de favoris est disponible après connexion."
          actionText="Se connecter"
          onAction={onLoginPress || (() => {})}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSearchPress={onSearchPress} onCartPress={onCartPress} />

      <View style={styles.titleBox}>
        <Text style={styles.screenTitle}>Mes Favoris ({items.length})</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {items.length === 0 ? (
        <EmptyState
          type="wishlist"
          title="Aucun favori enregistré"
          description="Enregistrez vos produits coup de cœur en cliquant sur l'icône cœur."
          actionText="Découvrir des produits"
          onAction={onExplorePress}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={item.product}
                onPress={() => onProductPress(item.product)}
                onLoginPress={onLoginPress}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleBox: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
