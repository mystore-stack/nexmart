// mobile/src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Header } from '../components/common/Header';
import { HeroCarousel } from '../components/common/HeroCarousel';
import { CategoryPills } from '../components/common/CategoryPills';
import { SectionHeader } from '../components/common/SectionHeader';
import { ProductCard } from '../components/common/ProductCard';
import { SkeletonGrid } from '../components/common/SkeletonLoader';
import { Product, Category, HeroBanner, Brand } from '../types';
import { mobileCmsAPI, MobileCMSSectionData } from '../api/mobileCms';
import { productsAPI } from '../api/products';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useLocaleStore } from '../store/useLocaleStore';
import { ArrowRight } from 'lucide-react-native';

interface HomeScreenProps {
  onProductPress: (product: Product) => void;
  onSearchPress: () => void;
  onCartPress: () => void;
  onNotificationPress?: () => void;
  onSeeAllProducts: () => void;
  onLoginPress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onProductPress,
  onSearchPress,
  onCartPress,
  onNotificationPress,
  onSeeAllProducts,
  onLoginPress,
}) => {
  const [sections, setSections] = useState<MobileCMSSectionData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { t, isRTL } = useLocaleStore();

  const loadData = useCallback(async () => {
    try {
      const [cmsResult, prodResult] = await Promise.allSettled([
        mobileCmsAPI.getMobileCMS(),
        productsAPI.getProducts({ limit: 20 }),
      ]);

      if (cmsResult.status === 'fulfilled' && cmsResult.value) {
        // Sort sections by order from CMS
        const sortedSections = (cmsResult.value.sections || []).sort((a, b) => a.order - b.order);
        setSections(sortedSections);
        if (cmsResult.value.categories?.length > 0) setCategories(cmsResult.value.categories);
        if (cmsResult.value.brands?.length > 0) setBrands(cmsResult.value.brands);
      } else {
        console.warn('Failed to load CMS data:', cmsResult.status === 'rejected' ? cmsResult.reason : 'No data');
      }

      if (prodResult.status === 'fulfilled' && prodResult.value) {
        setFallbackProducts(prodResult.value.products || []);
      }
    } catch (err) {
      console.warn('Failed to load mobile home screen data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const renderHeroCarouselSection = (sec: MobileCMSSectionData) => {
    const banners: HeroBanner[] = sec.config?.banners?.map((b, idx) => ({
      id: b.id || `banner-${idx}`,
      title: t(b.titleFr, b.titleAr),
      subtitle: t(b.subtitleFr || '', b.subtitleAr || ''),
      image: b.image,
      ctaText: t(b.ctaFr || "Voir l'offre", b.ctaAr || 'تصفح العرض'),
      badgeText: t(b.badgeFr || 'Offre spéciale', b.badgeAr || 'عرض خاص'),
    })) || [
      {
        id: 'hero-1',
        title: t('La technologie à portée de main', 'التكنولوجيا بين يديك'),
        subtitle: t('Découvrez nos meilleurs produits électroniques avec des prix exclusifs.', 'اكتشف أفضل منتجاتنا الإلكترونية بأسعار حصرية.'),
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        ctaText: t("Voir l'offre", 'تصفح العرض'),
        badgeText: t('Offre spéciale', 'عرض خاص'),
      },
    ];

    return <HeroCarousel key={sec.id || sec.sectionKey} banners={banners} />;
  };

  const renderCategoriesSection = (sec: MobileCMSSectionData) => (
    <CategoryPills
      key={sec.id || sec.sectionKey}
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
    />
  );

  const renderHorizontalProducts = (sec: MobileCMSSectionData) => {
    const sectionProducts = sec.products && sec.products.length > 0 ? sec.products : fallbackProducts.slice(0, 8);

    return (
      <View key={sec.id || sec.sectionKey}>
        <SectionHeader
          title={t(sec.titleFr, sec.titleAr)}
          subtitle={t(sec.subtitleFr || '', sec.subtitleAr || '')}
          onSeeAll={onSeeAllProducts}
          iconType="flame"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {sectionProducts.map((prod) => (
            <View key={prod.id} style={styles.horizontalCardWrapper}>
              <ProductCard product={prod} onPress={() => onProductPress(prod)} width={160} onLoginPress={onLoginPress} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBrandsSection = (sec: MobileCMSSectionData) => {
    const displayBrands = brands && brands.length > 0 ? brands : [];

    return (
      <View key={sec.id || sec.sectionKey}>
        <SectionHeader
          title={t(sec.titleFr, sec.titleAr)}
          subtitle={t(sec.subtitleFr || '', sec.subtitleAr || '')}
          onSeeAll={onSeeAllProducts}
          iconType="sparkles"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsScroll}>
          {displayBrands.map((b) => (
            <View key={b.id} style={styles.brandCard}>
              <Text style={styles.brandNameText}>{b.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderProductGridSection = (sec: MobileCMSSectionData) => {
    const sectionProducts = sec.products && sec.products.length > 0 ? sec.products : fallbackProducts.slice(0, 6);
    const icon = sec.sectionKey === 'meilleuresVentes' ? 'crown' : 'tag';

    return (
      <View key={sec.id || sec.sectionKey}>
        <SectionHeader
          title={t(sec.titleFr, sec.titleAr)}
          subtitle={t(sec.subtitleFr || '', sec.subtitleAr || '')}
          onSeeAll={onSeeAllProducts}
          iconType={icon}
        />
        <View style={styles.productGrid}>
          {sectionProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onPress={() => onProductPress(prod)} onLoginPress={onLoginPress} />
          ))}
        </View>
      </View>
    );
  };

  const renderPromoBannerSection = (sec: MobileCMSSectionData) => {
    const bannerImg = sec.bannerImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';

    return (
      <View key={sec.id || sec.sectionKey} style={styles.bannerContainer}>
        <TouchableOpacity activeOpacity={0.92} style={styles.bannerCard} onPress={onSeeAllProducts}>
          <Image source={{ uri: bannerImg }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay} />
          <View style={[styles.bannerContent, isRTL && styles.bannerContentRTL]}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>{t('Équipement maison', 'تجهيزات منزلية')}</Text>
            </View>
            <Text style={[styles.bannerTitle, isRTL && styles.textRTL]}>{t(sec.titleFr, sec.titleAr)}</Text>
            <Text style={[styles.bannerSubtitle, isRTL && styles.textRTL]} numberOfLines={2}>
              {t(sec.subtitleFr || 'Des produits de qualité pour un intérieur moderne.', sec.subtitleAr || 'منتجات عالية الجودة لمنزل عصري.')}
            </Text>
            <View style={styles.bannerCta}>
              <Text style={styles.bannerCtaText}>{t('Découvrir', 'إكتشف الآن')}</Text>
              <ArrowRight size={13} color="#0F172A" style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = (sec: MobileCMSSectionData) => {
    if (!sec.active) return null;

    switch (sec.sectionKey) {
      case 'heroCarousel':
        return renderHeroCarouselSection(sec);
      case 'categories':
        return renderCategoriesSection(sec);
      case 'offresDuMoment':
        return renderHorizontalProducts(sec);
      case 'marquesVedettes':
        return renderBrandsSection(sec);
      case 'meilleuresVentes':
      case 'nouveautes':
        return renderProductGridSection(sec);
      case 'promoBanner':
        return renderPromoBannerSection(sec);
      default:
        return renderProductGridSection(sec);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        onSearchPress={onSearchPress}
        onCartPress={onCartPress}
        onNotificationPress={onNotificationPress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          sections.map(renderSection)
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
  horizontalScroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  horizontalCardWrapper: {
    marginRight: Spacing.sm,
  },
  brandsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  brandCard: {
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  brandNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: 0.5,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  bannerContainer: {
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.md,
  },
  bannerCard: {
    height: 175,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  bannerContent: {
    padding: Spacing.lg,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  bannerContentRTL: {
    alignItems: 'flex-end',
  },
  bannerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  bannerBadgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#E2E8F0',
    marginBottom: Spacing.sm + 2,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  bannerCtaText: {
    color: Colors.navy,
    fontSize: 12,
    fontWeight: '800',
  },
  textRTL: {
    textAlign: 'right',
  },
});
