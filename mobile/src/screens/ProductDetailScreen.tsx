// mobile/src/screens/ProductDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Share,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Product, ProductVariant } from '../types';
import { productsAPI } from '../api/products';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onCheckoutNow: () => void;
  onLoginPress: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product: initialProduct,
  onBack,
  onCheckoutNow,
  onLoginPress,
}) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const freshProduct = await productsAPI.getProductById(initialProduct.id);
      setProduct(freshProduct);
      setSelectedVariant(freshProduct.variants?.[0] || null);
      setActiveImageIndex(0);
    } catch (error: any) {
      setLoadError(error?.message || 'Impossible de charger ce produit');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadProduct();
  }, [initialProduct.id]);

  const isFav = useWishlistStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const images = product.images || [];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const comparePrice = selectedVariant ? selectedVariant.comparePrice : product.comparePrice;

  const discountPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez ${product.name} sur NexMart: https://nexmart.ma/product/${product.id}`,
      });
    } catch {
      // Ignore share error
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      onLoginPress();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem(product, selectedVariant?.id, quantity);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      onLoginPress();
      return;
    }
    handleAddToCart();
    onCheckoutNow();
  };

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.stateText}>Chargement du produit...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateTitle}>Produit indisponible</Text>
        <Text style={styles.stateText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Top Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.circleButton} onPress={onBack}>
          <ArrowLeft size={20} color={Colors.navy} />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.circleButton} onPress={handleShare}>
            <Share2 size={18} color={Colors.navy} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(product);
            }}
          >
            <Heart
              size={18}
              color={isFav ? Colors.accentRed : Colors.navy}
              fill={isFav ? Colors.accentRed : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image Swiper */}
        <View style={[styles.imageGallery, { width, height: Math.min(width * 0.95, 360) }]}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[activeImageIndex] }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.mainImageEmpty}>
              <Text style={styles.mainImageEmptyText}>Image indisponible</Text>
            </View>
          )}

          {discountPercent !== null && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}

          {/* Thumbnail Selector */}
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbnail,
                    activeImageIndex === idx && styles.activeThumbnail,
                  ]}
                  onPress={() => setActiveImageIndex(idx)}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Details Card */}
        <View style={styles.infoCard}>
          {/* Rating & Stock Status */}
          <View style={styles.topStatusRow}>
            {product.reviewCount > 0 && product.rating > 0 ? (
              <View style={styles.ratingBox}>
                <Star size={14} color={Colors.gold} fill={Colors.gold} />
                <Text style={styles.ratingVal}>{product.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({product.reviewCount} avis)</Text>
              </View>
            ) : (
              <View />
            )}

            <View style={styles.stockBadge}>
              <View style={styles.stockDot} />
              <Text style={styles.stockText}>
                {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
              </Text>
            </View>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price Section */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{currentPrice} DH</Text>
            {comparePrice && comparePrice > currentPrice && (
              <Text style={styles.oldPrice}>{comparePrice} DH</Text>
            )}
            <Text style={styles.vatText}>TVA incluse</Text>
          </View>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Options disponibles :</Text>
              <View style={styles.variantContainer}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.variantPill, isSelected && styles.activeVariantPill]}
                      onPress={() => setSelectedVariant(v)}
                    >
                      <Text
                        style={[
                          styles.variantText,
                          isSelected && styles.activeVariantText,
                        ]}
                      >
                        {v.name} ({v.price} DH)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityRow}>
            <Text style={styles.sectionTitle}>Quantité :</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} color={Colors.navy} />
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} color={Colors.navy} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description du produit</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Delivery & Warranty Guarantees */}
          <View style={styles.guaranteesCard}>
            <View style={styles.guaranteeItem}>
              <Truck size={20} color={Colors.primary} />
              <View style={styles.guaranteeTextCol}>
                <Text style={styles.guaranteeTitle}>Livraison Partout au Maroc</Text>
                <Text style={styles.guaranteeSub}>24h à 48h à Casablanca, Rabat & Villes Principales</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.guaranteeItem}>
              <ShieldCheck size={20} color={Colors.gold} />
              <View style={styles.guaranteeTextCol}>
                <Text style={styles.guaranteeTitle}>Garantie Authenticité & Reconstitution</Text>
                <Text style={styles.guaranteeSub}>Paiement à la livraison ou par Carte Bancaire Sécurisée</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        <TouchableOpacity
          style={styles.cartBtn}
          activeOpacity={0.8}
          onPress={handleAddToCart}
        >
          <ShoppingBag size={20} color={Colors.primary} />
          <Text style={styles.cartBtnText}>Ajouter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyBtn}
          activeOpacity={0.8}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyBtnText}>Acheter Maintenant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  stateTitle: {
    color: Colors.navy,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  stateText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  retryButtonText: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
  backText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageGallery: {
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  mainImageEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  mainImageEmptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  discountBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.accentRed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  discountText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
  },
  thumbnailRow: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginLeft: 6,
  },
  activeThumbnail: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    marginTop: -Radius.xl,
    padding: Spacing.lg,
  },
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    lineHeight: 28,
    marginVertical: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  oldPrice: {
    fontSize: 15,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginRight: Spacing.sm,
  },
  vatText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  section: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  variantContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  variantPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  activeVariantPill: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  variantText: {
    fontSize: 13,
    color: Colors.navy,
  },
  activeVariantText: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
    paddingHorizontal: Spacing.md,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  guaranteesCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guaranteeTextCol: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
  guaranteeSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.modal,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  cartBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  buyBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buyBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
});
