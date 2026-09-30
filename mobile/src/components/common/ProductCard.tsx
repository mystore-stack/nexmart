// mobile/src/components/common/ProductCard.tsx
import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { Heart, ShoppingBag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Product } from '../../types';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number;
  onLoginPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, width: customWidth, onLoginPress }) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = customWidth || (windowWidth - Spacing.md * 3) / 2;
  const favoriteScale = useRef(new Animated.Value(1)).current;
  const isFav = useWishlistStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleFavoritePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    Animated.sequence([
      Animated.spring(favoriteScale, { toValue: 1.25, useNativeDriver: true, speed: 30 }),
      Animated.spring(favoriteScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    toggleFavorite(product);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      onLoginPress?.();
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    addItem(product, undefined, 1);
  };

  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      activeOpacity={0.92}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />

        {discountPercent !== null && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={handleFavoritePress}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
            <Heart
              size={15}
              color={isFav ? Colors.accentRed : '#64748B'}
              fill={isFav ? Colors.accentRed : 'transparent'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price} DH</Text>
            {product.comparePrice && product.comparePrice > product.price ? (
              <Text style={styles.oldPrice}>{product.comparePrice} DH</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            activeOpacity={0.8}
            onPress={handleAddToCart}
            accessibilityLabel="Ajouter au panier"
          >
            <ShoppingBag size={15} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  discountText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  details: {
    padding: Spacing.sm + 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    lineHeight: 18,
    height: 36,
    marginBottom: Spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  oldPrice: {
    fontSize: 10,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  cartButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
