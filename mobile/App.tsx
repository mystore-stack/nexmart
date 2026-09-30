// mobile/App.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';

// Theme & Stores
import { Colors } from './src/theme';
import { useAuthStore } from './src/store/useAuthStore';
import { useCartStore } from './src/store/useCartStore';
import { Product, Order, Address } from './src/types';

// Services & Components
import { CustomTabBar, TabType } from './src/components/navigation/CustomTabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { OrderConfirmationScreen } from './src/screens/OrderConfirmationScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { WishlistScreen } from './src/screens/WishlistScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { registerForPushNotificationsAsync } from './src/services/notifications';
import { parseDeepLinkUrl } from './src/services/deepLinking';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Overlay / Detail Screens
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [isOrdersVisible, setIsOrdersVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const loadUser = useAuthStore((state) => state.loadUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    loadUser();
    registerForPushNotificationsAsync();

    // Listen for deep links (e.g. nexmart://product/123 or https://nexmart.ma/product/123)
    const handleDeepLink = (event: { url: string }) => {
      const link = parseDeepLinkUrl(event.url);
      if (link?.screen === 'cart') {
        setActiveTab('cart');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthLoading, isAuthenticated]);

  // Screen Navigation Renderers
  const renderCurrentScreen = () => {
    if (isSearchVisible) {
      return (
        <SearchScreen
          onBack={() => setIsSearchVisible(false)}
          onProductPress={(prod) => {
            setIsSearchVisible(false);
            setSelectedProduct(prod);
          }}
          onLoginPress={() => setIsAuthVisible(true)}
        />
      );
    }

    if (selectedProduct) {
      return (
        <ProductDetailScreen
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onCheckoutNow={() => {
            setSelectedProduct(null);
            setIsCheckoutVisible(true);
          }}
          onLoginPress={() => setIsAuthVisible(true)}
        />
      );
    }

    if (isCheckoutVisible) {
      return (
        <CheckoutScreen
          savedAddress={selectedAddress}
          onBack={() => setIsCheckoutVisible(false)}
          onOrderSuccess={(order) => {
            setIsCheckoutVisible(false);
            setConfirmedOrder(order);
          }}
        />
      );
    }

    if (confirmedOrder) {
      return (
        <OrderConfirmationScreen
          order={confirmedOrder}
          onHomePress={() => {
            setConfirmedOrder(null);
            setActiveTab('home');
          }}
          onViewOrdersPress={() => {
            setConfirmedOrder(null);
            setActiveTab('account');
            setIsOrdersVisible(true);
          }}
        />
      );
    }

    if (isAuthVisible) {
      return (
        <AuthScreen
          onBack={() => setIsAuthVisible(false)}
          onSuccess={() => setIsAuthVisible(false)}
        />
      );
    }

    if (isNotificationsVisible) {
      return (
        <NotificationsScreen
          onBack={() => setIsNotificationsVisible(false)}
        />
      );
    }

    if (isOrdersVisible) {
      return (
        <OrdersScreen
          onSearchPress={() => setIsSearchVisible(true)}
          onLoginPress={() => setIsAuthVisible(true)}
          onCartPress={() => {
            setIsOrdersVisible(false);
            setActiveTab('cart');
          }}
          onExplorePress={() => {
            setIsOrdersVisible(false);
            setActiveTab('home');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onProductPress={setSelectedProduct}
            onSearchPress={() => setIsSearchVisible(true)}
            onCartPress={() => setActiveTab('cart')}
            onNotificationPress={() => setIsNotificationsVisible(true)}
            onSeeAllProducts={() => setActiveTab('categories')}
            onLoginPress={() => setIsAuthVisible(true)}
          />
        );
      case 'categories':
        return (
          <CategoriesScreen
            onProductPress={setSelectedProduct}
            onSearchPress={() => setIsSearchVisible(true)}
            onCartPress={() => setActiveTab('cart')}
            onLoginPress={() => setIsAuthVisible(true)}
          />
        );
      case 'wishlist':
        return (
          <WishlistScreen
            onProductPress={setSelectedProduct}
            onSearchPress={() => setIsSearchVisible(true)}
            onCartPress={() => setActiveTab('cart')}
            onExplorePress={() => setActiveTab('home')}
            onLoginPress={() => setIsAuthVisible(true)}
          />
        );
      case 'cart':
        return (
          <CartScreen
            onCheckoutPress={() => setIsCheckoutVisible(true)}
            onExplorePress={() => setActiveTab('home')}
            onLoginPress={() => setIsAuthVisible(true)}
          />
        );
      case 'account':
        return (
          <AccountScreen
            onNavigateOrders={() => setIsOrdersVisible(true)}
            onNavigateWishlist={() => setActiveTab('wishlist')}
            onNavigateAuth={() => setIsAuthVisible(true)}
            onAddressSelected={setSelectedAddress}
          />
        );
      default:
        return null;
    }
  };

  const showTabBar =
    !selectedProduct &&
    !isSearchVisible &&
    !isCheckoutVisible &&
    !confirmedOrder &&
    !isNotificationsVisible &&
    !isAuthVisible;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
        <View style={styles.screenWrapper}>{renderCurrentScreen()}</View>

        {/* Native Bottom Navigation Bar */}
        {showTabBar && (
          <CustomTabBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setIsOrdersVisible(false);
              setActiveTab(tab);
            }}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  screenWrapper: {
    flex: 1,
  },
});
