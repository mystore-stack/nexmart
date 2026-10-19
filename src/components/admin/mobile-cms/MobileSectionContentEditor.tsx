"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { resolveMobileSectionEditorType, type MobileSectionEditorType } from "@/lib/cms/mobile-section-types";
import { HeroStudio } from "./HeroStudio";
import { CategoriesStudio } from "./CategoriesStudio";
import { BrandsStudio } from "./BrandsStudio";
import { ProductsSectionStudio } from "./ProductsSectionStudio";
import { FlashSaleStudio } from "./FlashSaleStudio";
import { BannerStudio } from "./BannerStudio";
import { MomentOffersStudio } from "./MomentOffersStudio";
import { AnnouncementPopupStudio } from "./AnnouncementPopupStudio";
import { CustomBannerStudio } from "./CustomBannerStudio";

type SectionDraft = {
  sectionKey: string;
  type?: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  layoutType: string;
  bannerImage: string;
  config: Record<string, any>;
  productIds: string[];
  categoryIds: string[];
  brandIds: string[];
  startAt: string;
  endAt: string;
};

interface Props {
  section: SectionDraft;
  onChange: (patch: Partial<SectionDraft>) => void;
  categories: any[];
  brands: any[];
  products: any[];
}

type EditorProps = Props & { editorType: MobileSectionEditorType };
type EditorComponent = React.ComponentType<EditorProps>;

const fieldClass = "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";
const safeDestination = (value: string) => {
  const destination = value.trim();
  if (!destination) return true;
  if (destination.startsWith("/") && !destination.startsWith("//") && !destination.split(/[/?#]/).includes("..")) return true;
  try {
    const url = new URL(destination);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
};

function updateConfig(section: SectionDraft, onChange: Props["onChange"], patch: Record<string, unknown>) {
  onChange({ config: { ...(section.config || {}), ...patch } });
}

function HeroContentEditor(props: EditorProps) {
  const { section, onChange, categories, products } = props;
  return <HeroStudio banners={section.config?.banners || []} onChange={(banners) => updateConfig(section, onChange, { banners })} categories={categories} products={products} />;
}

function CategoriesContentEditor(props: EditorProps) {
  const { section, onChange, categories } = props;
  return <CategoriesStudio categoryIds={section.categoryIds} onChangeCategoryIds={(categoryIds) => onChange({ categoryIds })} categories={categories} config={section.config} onChangeConfig={(config) => onChange({ config })} layoutType={section.layoutType} onChangeLayoutType={(layoutType) => onChange({ layoutType })} />;
}

function BrandsContentEditor(props: EditorProps) {
  const { section, onChange, brands } = props;
  return <BrandsStudio brandIds={section.brandIds} onChangeBrandIds={(brandIds) => onChange({ brandIds })} config={section.config} onChangeConfig={(config) => onChange({ config })} brands={brands} titleAr={section.titleAr} subtitleAr={section.subtitleAr} onChangeTitleAr={(titleAr) => onChange({ titleAr })} onChangeSubtitleAr={(subtitleAr) => onChange({ subtitleAr })} />;
}

function ProductCollectionEditor(props: EditorProps) {
  const { section, onChange, products } = props;
  const eligibleProducts = props.editorType === "grouped-offers"
    ? products.filter((product) => Number(product.stock) > 0 && Number(product.oldPrice ?? product.comparePrice) > Number(product.price))
    : products;
  return <div className="space-y-3">
    {props.editorType === "grouped-offers" && <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Cette section affiche des produits remisés existants. L’application ajoute chaque produit séparément au panier; aucun achat groupé ni remise de bundle n’est configuré ici.</p>}
    <ProductsSectionStudio sectionKey={section.sectionKey} productIds={section.productIds} onChangeProductIds={(productIds) => onChange({ productIds })} config={section.config} onChangeConfig={(config) => onChange({ config })} layoutType={section.layoutType} onChangeLayoutType={(layoutType) => onChange({ layoutType })} products={eligibleProducts} />
  </div>;
}

function FlashSaleContentEditor(props: EditorProps) {
  const { section, onChange, products } = props;
  const eligibleProducts = products.filter((product) => Number(product.stock) > 0 && Number(product.oldPrice ?? product.comparePrice) > Number(product.price));
  return <FlashSaleStudio productIds={section.productIds} onChangeProductIds={(productIds) => onChange({ productIds })} startAt={section.startAt} onChangeStartAt={(startAt) => onChange({ startAt: startAt || "" })} endAt={section.endAt} onChangeEndAt={(endAt) => onChange({ endAt: endAt || "" })} config={section.config} onChangeConfig={(config) => onChange({ config })} products={eligibleProducts} />;
}

function OffersContentEditor({ section, onChange }: EditorProps) {
  const advertisements = Array.isArray(section.config?.advertisements) ? section.config.advertisements : [];
  return <MomentOffersStudio advertisements={advertisements} onChangeAdvertisements={(next) => updateConfig(section, onChange, { advertisements: next })} />;
}

function DiscoverContentEditor(props: EditorProps) {
  const { section, onChange, categories, products, brands } = props;
  return <BannerStudio bannerImage={section.bannerImage} onChangeBannerImage={(bannerImage) => onChange({ bannerImage: bannerImage || "" })} config={section.config} onChangeConfig={(config) => onChange({ config })} categories={categories} products={products} brands={brands} />;
}

function CouponContentEditor({ section, onChange }: EditorProps) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const page = section.config?.destinationPage || {};

  useEffect(() => {
    let active = true;
    fetch("/api/admin/coupons")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Impossible de charger les coupons");
        if (active) {
          const now = Date.now();
          setCoupons((result.data || []).filter((coupon: any) => coupon.active
            && (!coupon.startDate || new Date(coupon.startDate).getTime() <= now)
            && (!coupon.endDate || new Date(coupon.endDate).getTime() >= now)));
        }
      })
      .catch((error) => { if (active) setLoadError(error.message || "Erreur de chargement des coupons"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-4">
      <header><h3 className="text-sm font-bold">Aperçu des coupons disponibles</h3><p className="mt-1 text-xs text-slate-600">L’application charge les coupons actifs selon leur disponibilité. La configuration CMS règle uniquement le nombre de coupons affichés; les règles de coupon restent côté serveur.</p></header>
      <label className="block text-xs font-semibold">Nombre maximal affiché
        <input type="number" min={1} max={12} value={section.config?.limit ?? 4} onChange={(event) => updateConfig(section, onChange, { limit: Math.max(1, Math.min(12, Number(event.target.value) || 1)) })} className={fieldClass} />
      </label>
      {loading && <p className="text-sm text-slate-500">Chargement des coupons…</p>}
      {loadError && <p role="alert" className="text-sm text-rose-700">{loadError}</p>}
      {!loading && !loadError && !coupons.length && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Aucun coupon actif et éligible n’est disponible.</p>}
      <div className="divide-y rounded-md border border-slate-200">
        {coupons.slice(0, section.config?.limit ?? 4).map((coupon) => <div key={coupon.id} className="p-3 text-sm">
          <span className="block font-semibold">{coupon.code}</span><span className="text-xs text-slate-500">{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `${coupon.value} MAD`}{coupon.minOrder ? ` · Dès ${coupon.minOrder} MAD` : ""}</span>
        </div>)}
      </div>
      <fieldset className="grid gap-3 rounded-md border border-slate-200 p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">Page Coupons</legend>
        <label className="text-xs font-semibold">Titre (FR)<input value={page.titleFr || ""} maxLength={120} onChange={(event) => updateConfig(section, onChange, { destinationPage: { ...page, titleFr: event.target.value } })} className={fieldClass} /></label>
        <label dir="rtl" className="text-xs font-semibold">العنوان (AR)<input value={page.titleAr || ""} maxLength={120} onChange={(event) => updateConfig(section, onChange, { destinationPage: { ...page, titleAr: event.target.value } })} className={fieldClass} /></label>
        <label className="text-xs font-semibold">Sous-titre (FR)<input value={page.subtitleFr || ""} maxLength={240} onChange={(event) => updateConfig(section, onChange, { destinationPage: { ...page, subtitleFr: event.target.value } })} className={fieldClass} /></label>
        <label className="text-xs font-semibold">Nombre de coupons sur la page<input type="number" min={1} max={24} value={page.limit ?? 12} onChange={(event) => updateConfig(section, onChange, { destinationPage: { ...page, limit: Math.max(1, Math.min(24, Number(event.target.value) || 1)) } })} className={fieldClass} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={page.enabled !== false} onChange={(event) => updateConfig(section, onChange, { destinationPage: { ...page, enabled: event.target.checked } })} className="h-4 w-4 accent-emerald-700" />Page active</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={page.showHero !== false} onChange={(event) => updateConfig(section, onChange, { destinationPage: { ...page, showHero: event.target.checked } })} className="h-4 w-4 accent-emerald-700" />Afficher l’en-tête de page</label>
      </fieldset>
    </div>
  );
}

function PopupContentEditor(props: EditorProps) {
  const { section, onChange, products } = props;
  const isGiftQuest = props.editorType === "gift-quest";
  const config = section.config || {};
  const set = (key: string, value: unknown) => updateConfig(section, onChange, { [key]: value });
  const popupConfig = {
    ...config,
    template: isGiftQuest ? "gift-quest" : "welcome-offer",
    trigger: isGiftQuest ? "floating-button" : "home-entry",
  };

  return (
    <div className="space-y-5">
      <header><h3 className="text-sm font-bold">{isGiftQuest ? "Présentation Gift Quest" : "Offre de bienvenue"}</h3><p className="mt-1 text-xs text-slate-600">Contenu et déclenchement uniquement. Les récompenses, prix et règles d’éligibilité restent gérés côté serveur.</p></header>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold">Texte du bouton (FR)<input value={config.ctaText || ""} maxLength={80} onChange={(event) => set("ctaText", event.target.value)} className={fieldClass} /></label>
        <label dir="rtl" className="text-xs font-semibold">نص الزر (AR)<input value={config.ctaTextAr || ""} maxLength={80} onChange={(event) => set("ctaTextAr", event.target.value)} className={fieldClass} /></label>
        <label className="text-xs font-semibold sm:col-span-2">Destination sûre (URL HTTPS ou chemin de l’application)<input value={config.destinationUrl || ""} maxLength={512} onChange={(event) => set("destinationUrl", event.target.value)} aria-invalid={!safeDestination(config.destinationUrl || "")} className={fieldClass} /></label>
        <label className="text-xs font-semibold sm:col-span-2">Image (URL ou chemin d’asset)<input value={config.image || ""} maxLength={2048} onChange={(event) => set("image", event.target.value)} className={fieldClass} /></label>
        <label className="text-xs font-semibold">Fréquence d’affichage<select value={config.displayFrequency || "once"} onChange={(event) => set("displayFrequency", event.target.value)} className={fieldClass}><option value="once">Une fois</option><option value="session">Par session</option><option value="daily">Une fois par jour</option></select></label>
        <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={config.enabled !== false} onChange={(event) => set("enabled", event.target.checked)} className="h-4 w-4 accent-emerald-700" />Campagne visible</label>
      </div>
      {!safeDestination(config.destinationUrl || "") && <p role="alert" className="text-sm text-rose-700">Utilisez un chemin interne sûr ou une URL HTTPS sans identifiants.</p>}
      <ProductsSectionStudio sectionKey={section.sectionKey} productIds={section.productIds} onChangeProductIds={(productIds) => onChange({ productIds })} config={popupConfig} onChangeConfig={(next) => {
        const { template: _template, trigger: _trigger, ...editable } = next;
        updateConfig(section, onChange, editable);
      }} layoutType={section.layoutType} onChangeLayoutType={(layoutType) => onChange({ layoutType })} products={products} />
    </div>
  );
}

function GiftQuestContentEditor({ section, onChange, products }: EditorProps) {
  const config = section.config || {};
  const eligibleProducts = products.filter((product) => Number(product.stock) > 0 && product.published !== false && product.isVisible !== false);
  const update = (patch: Record<string, unknown>) => updateConfig(section, onChange, patch);
  return <div className="space-y-4">
    <header><h3 className="text-sm font-bold">Campagne Gift Quest</h3><p className="mt-1 text-xs text-slate-600">Configurez l’affichage et sélectionnez jusqu’à trois produits existants. Les récompenses, prix et règles de participation restent définis par le serveur.</p></header>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold">Nombre maximal de cadeaux
        <input type="number" min={1} max={3} value={config.maxGifts ?? config.limit ?? 3} onChange={(event) => update({ maxGifts: Math.max(1, Math.min(3, Number(event.target.value) || 1)) })} className={fieldClass} />
      </label>
      <label className="text-xs font-semibold">Fréquence de participation
        <select value={config.frequency || "once"} onChange={(event) => update({ frequency: event.target.value })} className={fieldClass}><option value="once">Une fois par campagne</option><option value="always">À chaque visite</option></select>
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.enabled !== false} onChange={(event) => update({ enabled: event.target.checked })} className="h-4 w-4 accent-emerald-700" />Campagne activée</label>
    </div>
    <ProductsSectionStudio sectionKey={section.sectionKey} productIds={section.productIds} onChangeProductIds={(productIds) => onChange({ productIds })} config={{ ...config, limit: config.maxGifts ?? config.limit ?? 3 }} onChangeConfig={(next) => {
      const { limit, ...rest } = next;
      update({ ...rest, maxGifts: limit });
    }} layoutType={section.layoutType} onChangeLayoutType={(layoutType) => onChange({ layoutType })} products={eligibleProducts} />
  </div>;
}

function SmartJourneyContentEditor({ section, onChange, products }: EditorProps) {
  const defaultStageKeys = ["discover", "explore", "favorites"];
  const stageLabels: Record<string, string> = { discover: "Découvrir", explore: "Explorer", favorites: "Favoris" };
  const configuredStages = Array.isArray(section.config?.stages) ? section.config.stages : [];
  const stages = defaultStageKeys
    .map((key, defaultOrder) => ({ key, order: defaultOrder, ...configuredStages.find((stage: any, index: number) => stage.key === key || (!stage.key && index === defaultOrder)) }))
    .sort((first, second) => first.order - second.order);
  const productIds: string[] = Array.isArray(section.config?.productIds) ? section.config.productIds : [];
  const updateStages = (next: any[]) => updateConfig(section, onChange, { stages: next.map((stage, order) => ({ ...stage, order })) });
  const moveStage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= stages.length) return;
    const next = [...stages];
    [next[index], next[target]] = [next[target], next[index]];
    updateStages(next);
  };
  const updateStage = (index: number, patch: Record<string, unknown>) => updateStages(stages.map((stage, i) => i === index ? { ...stage, ...patch } : stage));
  return (
    <div className="space-y-4">
      <header><h3 className="text-sm font-bold">Parcours Smart Journey</h3><p className="mt-1 text-xs text-slate-600">Les trois étapes natives restent en place. Les champs vides conservent le texte mobile par défaut; l’ordre et les textes personnalisés sont enregistrés comme surcharges.</p></header>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.config?.enabled !== false} onChange={(event) => updateConfig(section, onChange, { enabled: event.target.checked })} className="h-4 w-4 accent-emerald-700" />Parcours activé</label>
      {stages.map((stage: any, index: number) => <fieldset key={stage.key} className="space-y-3 rounded-md border border-slate-200 p-4">
        <legend className="px-1 text-xs font-bold">{stageLabels[stage.key]}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold">Titre (FR)<input placeholder="Texte mobile par défaut" value={stage.title?.fr || ""} maxLength={100} onChange={(event) => updateStage(index, { title: { ...(stage.title || {}), fr: event.target.value } })} className={fieldClass} /></label>
          <label dir="rtl" className="text-xs font-semibold">العنوان (AR)<input placeholder="النص الافتراضي للتطبيق" value={stage.title?.ar || ""} maxLength={100} onChange={(event) => updateStage(index, { title: { ...(stage.title || {}), ar: event.target.value } })} className={fieldClass} /></label>
          <label className="text-xs font-semibold sm:col-span-2">Description (FR)<textarea placeholder="Description mobile par défaut" value={stage.description?.fr || ""} maxLength={300} onChange={(event) => updateStage(index, { description: { ...(stage.description || {}), fr: event.target.value } })} className={fieldClass} /></label>
          <label dir="rtl" className="text-xs font-semibold sm:col-span-2">الوصف (AR)<textarea placeholder="الوصف الافتراضي للتطبيق" value={stage.description?.ar || ""} maxLength={300} onChange={(event) => updateStage(index, { description: { ...(stage.description || {}), ar: event.target.value } })} className={fieldClass} /></label>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={index === 0} onClick={() => moveStage(index, -1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">Monter</button>
          <button type="button" disabled={index === stages.length - 1} onClick={() => moveStage(index, 1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">Descendre</button>
        </div>
      </fieldset>)}
      <div className="space-y-2 rounded-md border border-slate-200 p-4"><h4 className="text-sm font-semibold">Produits du parcours</h4><p className="text-xs text-slate-600">Les produits doivent rester disponibles dans le catalogue. Sans sélection, l’application utilise sa sélection notée par le serveur.</p>{products.map((product) => <label key={product.id} className="flex items-center gap-3 py-1 text-sm"><input type="checkbox" checked={productIds.includes(product.id)} onChange={() => updateConfig(section, onChange, { productIds: productIds.includes(product.id) ? productIds.filter((id) => id !== product.id) : [...productIds, product.id] })} className="h-4 w-4 accent-emerald-700" /><span className="min-w-0 flex-1 truncate">{product.name}</span><span className="text-xs text-slate-500">{product.stock} en stock</span></label>)}</div>
    </div>
  );
}

function GiftContentEditor({ section, onChange }: EditorProps) {
  const giftFinder = section.config?.giftFinder || {};
  const options: Record<string, string[]> = {
    enabledOccasions: ["Anniversaire", "Mariage", "Fête des mères", "Fête des pères", "Noël", "Naissance", "Saint-Valentin", "Remerciement", "Cadeau surprise", "Sans occasion"],
    enabledRecipients: ["Partenaire", "Famille", "Ami(e)", "Enfant", "Collègue", "Pour moi", "Autre"],
    enabledBudgets: ["<200", "200-500", "500-1000", "1000-2000", ">2000"],
    enabledInterests: ["Tech", "Maison", "Beauté", "Mode", "Sport", "Premium"],
  };
  const labels: Record<string, string> = { enabledOccasions: "Occasions", enabledRecipients: "Destinataires", enabledBudgets: "Budgets (MAD)", enabledInterests: "Centres d’intérêt" };
  const toggle = (field: string, option: string) => {
    const current = Array.isArray(giftFinder[field]) ? giftFinder[field] : options[field];
    const next = current.includes(option) ? current.filter((value: string) => value !== option) : [...current, option];
    updateConfig(section, onChange, { giftFinder: { ...giftFinder, [field]: next } });
  };
  return <div className="space-y-4"><header><h3 className="text-sm font-bold">Préférences du Gift Finder</h3><p className="mt-1 text-xs text-slate-600">Activez les choix déjà pris en charge par l’application; la recherche produit et les prix restent gérés par le catalogue.</p></header>
    {Object.entries(options).map(([field, values]) => <fieldset key={field} className="space-y-2 rounded-md border border-slate-200 p-4"><legend className="px-1 text-sm font-semibold">{labels[field]}</legend>{values.map((option) => <label key={option} className="flex items-center gap-3 py-1 text-sm"><input type="checkbox" checked={(Array.isArray(giftFinder[field]) ? giftFinder[field] : values).includes(option)} onChange={() => toggle(field, option)} className="h-4 w-4 accent-emerald-700" />{option}</label>)}</fieldset>)}
  </div>;
}

function NexPlayContentEditor({ section, onChange }: EditorProps) {
  return <div className="space-y-4"><header><h3 className="text-sm font-bold">Teaser NexPlay</h3><p className="mt-1 text-xs text-slate-600">L’application utilise le titre, le sous-titre et la visibilité de cette section. Les panneaux, jeux, portefeuille, récompenses et règles d’éligibilité restent contrôlés par le serveur.</p></header>
    <label className="block text-xs font-semibold">Titre affiché<input value={section.titleFr} maxLength={120} onChange={(event) => onChange({ titleFr: event.target.value })} className={fieldClass} /></label>
    <label className="block text-xs font-semibold">Sous-titre affiché<input value={section.subtitleFr} maxLength={240} onChange={(event) => onChange({ subtitleFr: event.target.value })} className={fieldClass} /></label>
  </div>;
}

function PersonalContentEditor() {
  return <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-bold">Contenu personnalisé</h3><p className="mt-1 text-sm text-slate-600">Le renderer mobile génère cette section à partir du profil et des règles serveur. Il ne consomme pas de configuration éditoriale pour ce type.</p></div>;
}

function GenericMetadataContentEditor({ section }: EditorProps) {
  return <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-4"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-800" /><div><h3 className="text-sm font-bold text-amber-950">Éditeur spécifique indisponible</h3><p className="mt-1 text-sm text-amber-900">La section « {section.sectionKey} » (type « {section.type || "non défini"} ») n’a pas de contrat de contenu connu. Sa configuration existante est conservée; seuls les contrôles généraux peuvent être modifiés.</p></div></div></div>;
}

const EDITORS: Record<MobileSectionEditorType, EditorComponent> = {
  hero: HeroContentEditor,
  categories: CategoriesContentEditor,
  brands: BrandsContentEditor,
  offers: OffersContentEditor,
  products: ProductCollectionEditor,
  flash: FlashSaleContentEditor,
  "grouped-offers": ProductCollectionEditor,
  coupons: CouponContentEditor,
  "welcome-offer": PopupContentEditor,
  "smart-journey": SmartJourneyContentEditor,
  "gift-quest": GiftQuestContentEditor,
  "announcement-popup": AnnouncementPopupContentEditor,
  personal: PersonalContentEditor,
  gift: GiftContentEditor,
  discover: DiscoverContentEditor,
  nexplay: NexPlayContentEditor,
};

function CustomBannerContentEditor(props: EditorProps) {
  const { section, onChange } = props;
  return (
    <CustomBannerStudio
      titleFr={section.titleFr}
      titleAr={section.titleAr}
      subtitleFr={section.subtitleFr}
      subtitleAr={section.subtitleAr}
      bannerImage={section.bannerImage}
      config={section.config}
      onChangeTitleFr={(titleFr) => onChange({ titleFr })}
      onChangeTitleAr={(titleAr) => onChange({ titleAr })}
      onChangeSubtitleFr={(subtitleFr) => onChange({ subtitleFr })}
      onChangeSubtitleAr={(subtitleAr) => onChange({ subtitleAr })}
      onChangeBannerImage={(bannerImage) => onChange({ bannerImage: bannerImage || "" })}
      onChangeConfig={(config) => onChange({ config })}
    />
  );
}

function AnnouncementPopupContentEditor(props: EditorProps) {
  const { section, onChange, products } = props;
  return <AnnouncementPopupStudio titleFr={section.titleFr} titleAr={section.titleAr} subtitleFr={section.subtitleFr} subtitleAr={section.subtitleAr} startAt={section.startAt} endAt={section.endAt} config={section.config} products={products} onChange={(config) => onChange({ config })} onChangeField={(field, value) => onChange({ [field]: value })} />;
}

export function MobileSectionContentEditor(props: Props) {
  const normalizedKey = (props.section.sectionKey || "").toLowerCase();
  const normalizedType = (props.section.type || "").toLowerCase();
  if (normalizedType === "custom-banner" || normalizedKey.includes("custombanner") || normalizedKey.startsWith("sec_custom_banner")) {
    return <CustomBannerContentEditor {...props} editorType={"discover" as any} />;
  }
  const editorType = resolveMobileSectionEditorType(props.section.sectionKey, props.section.type);
  if (!editorType) return <GenericMetadataContentEditor {...props} editorType="personal" />;
  const Editor = EDITORS[editorType];
  if (!Editor) return <GenericMetadataContentEditor {...props} editorType="personal" />;
  return <Editor {...props} editorType={editorType} />;
}
