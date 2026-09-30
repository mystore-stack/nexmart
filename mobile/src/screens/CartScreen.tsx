// mobile/src/screens/CartScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Trash2, Minus, Plus, ArrowRight, Tag } from 'lucide-react-native';
import { EmptyState } from '../components/common/EmptyState';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CartScreenProps {
  onCheckoutPress: () => void;
  onExplorePress: () => void;
  onLoginPress: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onCheckoutPress,
  onExplorePress,
  onLoginPress,
}) => {
  const insets = useSafeAreaInsets();
  const { items, error, fetchCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 500 ? 0 : 35; // Free shipping over 500 DH
  const total = subtotal + deliveryFee;

  // Show login prompt if not authenticated
  if (!isAuthenticated && !isAuthLoading) {
    return (
      <View style={styles.container}>
        <EmptyState
          type="cart"
          title="Connectez-vous pour accéder à votre panier"
          description="Vous devez être connecté pour voir et gérer votre panier d'achats."
          actionText="Se connecter"
          onAction={onLoginPress}
        />
      </View>
    );
  }

  // Show loading while checking authentication
  if (isAuthLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          type="cart"
          title="Votre panier est vide"
          description="Explorez notre boutique et ajoutez des produits d'exception à votre panier."
          actionText="Découvrir nos produits"
          onAction={onExplorePress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Panier ({items.length})</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {/* Cart Item Cards */}
        {items.map((item) => {
          const product = item.product;
          const imageUrl = product?.images?.[0];
          const price = item.variant?.price || product?.price || 0;

          return (
            <View key={item.id} style={styles.itemCard}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImageEmpty}>
                  <Text style={styles.itemImageEmptyText}>Image indisponible</Text>
                </View>
              )}

              <View style={styles.itemDetails}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {product?.name || 'Produit'}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Trash2 size={18} color={Colors.accentRed} />
                  </TouchableOpacity>
                </View>

                {item.variant && (
                  <Text style={styles.variantText}>Option : {item.variant.name}</Text>
                )}

                <View style={styles.itemBottomRow}>
                  <Text style={styles.itemPrice}>{price * item.quantity} DH</Text>

                  {/* Quantity Counter */}
                  <View style={styles.qtyBox}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={14} color={Colors.navy} />
                    </TouchableOpacity>

                    <Text style={styles.qtyVal}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} color={Colors.navy} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Promo Code Input Box */}
        <View style={styles.promoCard}>
          <View style={styles.promoInputRow}>
            <Tag size={18} color={Colors.textMuted} style={{ marginRight: Spacing.xs }} />
            <TextInput
              style={styles.promoInput}
              placeholder="Code promo ou coupon"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif de la commande</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{subtotal} DH</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de livraison</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} DH`}
            </Text>
          </View>

          {subtotal <= 500 && (
            <Text style={styles.freeDeliveryHint}>
              Ajoutez {500 - subtotal} DH pour bénéficier de la livraison gratuite !
            </Text>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total TTC</Text>
            <Text style={styles.totalValue}>{total} DH</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        <View style={styles.bottomTotalCol}>
          <Text style={styles.bottomTotalLabel}>Total à payer :</Text>
          <Text style={styles.bottomTotalVal}>{total} DH</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.8}
          onPress={onCheckoutPress}
        >
          <Text style={styles.checkoutBtnText}>Commander</Text>
          <ArrowRight size={18} color={Colors.textWhite} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 110,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  itemImageEmpty: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  itemImageEmptyText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: Spacing.sm,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    flex: 1,
    marginRight: Spacing.xs,
  },
  variantText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    paddingHorizontal: 10,
  },
  promoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.navy,
  },
  applyBtn: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  applyBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  freeDeliveryHint: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.modal,
  },
  bottomTotalCol: {},
  bottomTotalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bottomTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.navy,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  checkoutBtnText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '800',
  },
});
