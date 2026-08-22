"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Crown, Gem, Lock, Unlock, ArrowRight, TrendingUp, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { mysteryBoxUrl, mysteryBoxesListingUrl, checkoutUrl } from "@/lib/navigation/NavigationService";
import toast from "react-hot-toast";

interface MysteryBoxTier {
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  price: number;
  value: number;
  winChance: number;
  rewards: string[];
}

const mysteryBoxTiers: MysteryBoxTier[] = [
  {
    name: "Bronze",
    icon: <Lock className="w-6 h-6" />,
    color: "from-amber-600 to-amber-800",
    gradient: "from-amber-100 to-amber-200",
    price: 99,
    value: 150,
    winChance: 80,
    rewards: ["Produits électroniques", "Accessoires", "Vêtements", "Cartes cadeaux"],
  },
  {
    name: "Silver",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-gray-400 to-gray-600",
    gradient: "from-gray-100 to-gray-200",
    price: 199,
    value: 350,
    winChance: 60,
    rewards: ["Smartphones", "Tablettes", "Montres", "Écouteurs premium"],
  },
  {
    name: "Gold",
    icon: <Crown className="w-6 h-6" />,
    color: "from-yellow-400 to-yellow-600",
    gradient: "from-yellow-100 to-yellow-200",
    price: 499,
    value: 1000,
    winChance: 40,
    rewards: ["iPhone", "Samsung Galaxy", "MacBook", "iPad Pro"],
  },
  {
    name: "Diamond",
    icon: <Gem className="w-6 h-6" />,
    color: "from-cyan-400 to-blue-500",
    gradient: "from-cyan-100 to-blue-200",
    price: 999,
    value: 2500,
    winChance: 20,
    rewards: ["iPhone 15 Pro", "MacBook Pro", "Apple Watch Ultra", "AirPods Max"],
  },
];

export function PremiumMysteryBox() {
  const [selectedTier, setSelectedTier] = useState<MysteryBoxTier | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const addMysteryBox = useCartStore((state: any) => state.addMysteryBox);
  const router = useRouter();

  const handleAddToCart = (tier: MysteryBoxTier) => {
    console.log("[MYSTERY BOX] CLICK");
    console.log("[MYSTERY BOX] ADDING TO CART");
    try {
      addMysteryBox({
        id: tier.name.toLowerCase(),
        name: `Mystery Box ${tier.name}`,
        price: tier.price,
        tier: tier.name,
        value: tier.value,
        winChance: tier.winChance,
        rewards: tier.rewards,
      }, 1, false); // Don't open cart for Buy Now flow
      console.log("[MYSTERY BOX] AFTER ADD");
      
      console.log("[MYSTERY BOX] ROUTER INSTANCE", router);
      
      toast.success(`${tier.name} Mystery Box added to cart! Redirecting to checkout...`, {
        duration: 2000,
      });
      
      console.log("[MYSTERY BOX] BEFORE PUSH");
      console.log("[MYSTERY BOX] NAVIGATING TO: /checkout");
      const result = router.push('/checkout');
      console.log("[MYSTERY BOX] AFTER PUSH", result);
    } catch (error) {
      console.error('[MYSTERY BOX] Error adding mystery box to cart:', error);
      toast.error('Failed to add mystery box to cart');
    }
  };

  return (
    <section className="relative bg-[#111111] py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8A04D]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0F6B57]/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(200 160 77 / 0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Gift className="w-4 h-4" />
            <span>Mystery Box</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-display">
            Box Mystère
            <span className="block text-[#C8A04D]">
              Gagnez jusqu&apos;à 5000 MAD
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ouvrez une boîte mystère et découvrez des surprises exclusives. Chaque box contient des produits premium d&apos;une valeur supérieure à son prix.
          </p>
        </motion.div>

        {/* Mystery Box Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="relative max-w-2xl mx-auto">
            {/* Main Mystery Box */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#1a1a1a] border border-[#C8A04D]/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C8A04D]/10 to-[#C8A04D]/5" />
              
              {/* Box Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {!isOpened ? (
                    <motion.div
                      key="closed"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="text-center space-y-6"
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-32 h-32 mx-auto bg-[#C8A04D] rounded-2xl flex items-center justify-center shadow-2xl"
                      >
                        <Gift className="w-16 h-16 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-3xl font-bold text-white mb-2 font-display">Box Mystère Premium</p>
                        <p className="text-gray-400">Valeur garantie: 1500 - 5000 MAD</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpened(true)}
                        className="bg-[#C8A04D] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Unlock className="w-5 h-5 inline mr-2" />
                        Ouvrir pour 499 MAD
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="opened"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                        className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl"
                      >
                        <Sparkles className="w-16 h-16 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-3xl font-bold text-white mb-2">🎉 Félicitations!</p>
                        <p className="text-gray-400">Vous avez gagné un iPhone 15 Pro</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-2">Valeur: 12,999 MAD</p>
                      </div>
                      <Link href={mysteryBoxesListingUrl()}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          Voir mon cadeau
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: "Gagnants aujourd'hui", value: "234" },
                { label: "Total distribué", value: "1.2M MAD" },
                { label: "Taux de gain", value: "95%" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tier Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">Choisissez votre tier</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mysteryBoxTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedTier(tier)}
                className={`relative bg-gradient-to-br ${tier.gradient} rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedTier?.name === tier.name ? 'ring-4 ring-amber-500 scale-105' : ''
                }`}
              >
                {/* Tier Badge */}
                <div className={`absolute top-4 right-4 bg-gradient-to-r ${tier.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                  {tier.name}
                </div>

                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {tier.icon}
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-sm text-gray-600">Prix</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {tier.price.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                    </p>
                  </div>

                  {/* Value */}
                  <div>
                    <p className="text-sm text-gray-600">Valeur garantie</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {tier.value.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                    </p>
                  </div>

                  {/* Win Chance */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Chance de gain</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${tier.color} h-2 rounded-full`}
                        style={{ width: `${tier.winChance}%` }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{tier.winChance}%</p>
                  </div>

                  {/* Rewards Preview */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Récompenses possibles:</p>
                    <ul className="space-y-1">
                      {tier.rewards.slice(0, 2).map((reward, j) => (
                        <li key={j} className="text-xs text-gray-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          {reward}
                        </li>
                      ))}
                      {tier.rewards.length > 2 && (
                        <li className="text-xs text-gray-500">+{tier.rewards.length - 2} autres</li>
                      )}
                    </ul>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(tier)}
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Ajouter au panier</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href={mysteryBoxesListingUrl()}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Explorer toutes les boxes</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
