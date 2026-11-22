"use client";
// src/app/admin/categories/page.tsx
// NEXMART MASTER CATEGORIES - Owner-Controlled Category Management System

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Layers,
  Search,
  Sliders,
  Sparkles,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  LayoutGrid,
  ListTree,
  ExternalLink,
  RefreshCw,
  GripVertical,
  Upload,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  Clock,
  Package,
  Store,
  Tag,
  AlertCircle,
  CornerDownRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  buildCategoryTree,
  flattenCategoryTree,
  findCategoryDuplicates,
  slugifyCategory,
  CategoryNode,
} from "@/lib/category-tree-utils";

type CatalogContext = "shop" | "requests" | "audit";

export default function MasterCategoriesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  // Catalog Context: Shop (default) | Requests | Audit
  const [context, setContext] = useState<CatalogContext>("shop");
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");

  // Shop Categories State
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Seller Requests State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Bulk Selection
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [bulkActionBusy, setBulkActionBusy] = useState(false);

  // Create / Edit Category Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "" as string | null,
    image: "",
    icon: "",
    bannerImage: "",
    order: 0,
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT" | "ARCHIVED",
    isFeatured: false,
    showOnHomepage: true,
  });
  const [savingCategory, setSavingCategory] = useState(false);

  // Safe Deletion Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryNode | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>("");
  const [deletingBusy, setDeletingBusy] = useState(false);

  // DND Kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch Shop Categories
  const fetchShopCategories = useCallback(async () => {
    try {
      setLoadingShop(true);
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const d = await res.json();
        const rows: CategoryNode[] = d.data || [];
        setCategories(rows);

        // Auto-expand root categories by default
        const initExpanded: Record<string, boolean> = {};
        rows.forEach((c) => {
          if (!c.parentId) initExpanded[c.id] = true;
        });
        setExpandedNodes((prev) => ({ ...initExpanded, ...prev }));
      } else {
        toast.error("Erreur de chargement des catégories Shop");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoadingShop(false);
    }
  }, []);

  // Fetch Seller Requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/admin/categories/requests");
      if (res.ok) {
        const d = await res.json();
        setRequests(d.data || []);
      }
    } catch {
      toast.error("Erreur de chargement des demandes vendeurs");
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoadingAudit(true);
      const res = await fetch("/api/admin/categories/audit");
      if (res.ok) {
        const d = await res.json();
        setAuditLogs(d.data || []);
      }
    } catch {
      toast.error("Erreur de chargement de l'audit");
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchShopCategories();
  }, [fetchShopCategories]);

  // Context Tab changes
  useEffect(() => {
    if (context === "requests") fetchRequests();
    if (context === "audit") fetchAuditLogs();
  }, [context, fetchRequests, fetchAuditLogs]);

  // Duplicate Category Detection
  const duplicates = useMemo(() => {
    return findCategoryDuplicates(categories);
  }, [categories]);

  // Filter & Build Category Tree
  const categoryTree = useMemo(() => {
    let filtered = categories;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => {
        const cfg = c.pageConfig as any;
        const st = cfg?.status || "PUBLISHED";
        return st === statusFilter;
      });
    }

    // Build hierarchical tree
    return buildCategoryTree(filtered);
  }, [categories, searchQuery, statusFilter]);

  // Flattened Tree for Drag-and-Drop or table display
  const flattenedList = useMemo(() => {
    return flattenCategoryTree(categoryTree);
  }, [categoryTree]);

  // Toggle tree node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Open Create Modal
  const openCreateModal = (parentCategory?: CategoryNode) => {
    setModalMode("create");
    setEditingId(null);
    setModalForm({
      name: "",
      slug: "",
      description: "",
      parentId: parentCategory ? parentCategory.id : null,
      image: "",
      icon: "",
      bannerImage: "",
      order: 0,
      status: "PUBLISHED",
      isFeatured: false,
      showOnHomepage: true,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryNode) => {
    setModalMode("edit");
    setEditingId(cat.id);
    const cfg = (cat.pageConfig as any) || {};
    setModalForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      parentId: cat.parentId || null,
      image: cat.image || "",
      icon: cfg.icon || "",
      bannerImage: cfg.bannerImage || "",
      order: cat.order || 0,
      status: cfg.status || "PUBLISHED",
      isFeatured: cfg.isFeatured || false,
      showOnHomepage: cfg.showOnHomepage ?? true,
    });
    setModalOpen(true);
  };

  // Save Category (Create or Edit)
  const handleSaveCategory = async () => {
    if (!modalForm.name.trim()) {
      toast.error("Le nom de la catégorie est obligatoire.");
      return;
    }

    try {
      setSavingCategory(true);
      const isEdit = modalMode === "edit" && editingId;
      const url = isEdit ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = isEdit ? "PATCH" : "POST";

      const payload: any = {
        name: modalForm.name.trim(),
        slug: modalForm.slug.trim() || slugifyCategory(modalForm.name),
        description: modalForm.description.trim() || null,
        parentId: modalForm.parentId || null,
        image: modalForm.image || null,
        order: modalForm.order || 0,
        pageConfig: {
          icon: modalForm.icon || null,
          bannerImage: modalForm.bannerImage || null,
          status: modalForm.status,
          isFeatured: modalForm.isFeatured,
          showOnHomepage: modalForm.showOnHomepage,
        },
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur de sauvegarde");
      }

      toast.success(isEdit ? "Catégorie mise à jour !" : "Nouvelle catégorie créée !");
      setModalOpen(false);
      fetchShopCategories();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSavingCategory(false);
    }
  };

  // Prompt Safe Delete Modal
  const promptDeleteCategory = (cat: CategoryNode) => {
    setCategoryToDelete(cat);
    setReassignTargetId("");
    setDeleteModalOpen(true);
  };

  // Execute Safe Delete or Archive
  const handleExecuteDelete = async (forceArchive: boolean = false) => {
    if (!categoryToDelete) return;
    try {
      setDeletingBusy(true);
      const params = new URLSearchParams();
      if (forceArchive) params.append("archive", "true");
      if (reassignTargetId) params.append("reassignToId", reassignTargetId);

      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}?${params.toString()}`, {
        method: "DELETE",
      });

      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(d.error || "Erreur de suppression");
      }

      toast.success(forceArchive ? "Catégorie archivée !" : "Catégorie supprimée en toute sécurité !");
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchShopCategories();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingBusy(false);
    }
  };

  // Reordering Drag End
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    try {
      const items = reordered.map((cat, idx) => ({
        id: cat.id,
        order: idx,
        parentId: cat.parentId || null,
      }));

      const res = await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        toast.success("Ordre des catégories mis à jour");
      } else {
        const d = await res.json();
        toast.error(d.error || "Erreur de réorganisation");
        fetchShopCategories();
      }
    } catch {
      toast.error("Erreur de connexion");
      fetchShopCategories();
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selectedCategoryIds.length === 0) return;
    if (action === "delete" && !confirm(`Confirmer la suppression ou l'archivage de ${selectedCategoryIds.length} catégorie(s) ?`)) {
      return;
    }

    try {
      setBulkActionBusy(true);
      for (const id of selectedCategoryIds) {
        if (action === "publish") {
          await fetch(`/api/admin/categories/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PUBLISHED" }),
          });
        } else if (action === "unpublish") {
          await fetch(`/api/admin/categories/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "DRAFT" }),
          });
        }
      }
      toast.success("Action groupée effectuée !");
      setSelectedCategoryIds([]);
      fetchShopCategories();
    } catch {
      toast.error("Erreur lors de l'action groupée");
    } finally {
      setBulkActionBusy(false);
    }
  };

  // Approve / Reject Seller Request
  const handleReviewRequest = async (requestId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/categories/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success(action === "approve" ? "Demande approuvée !" : "Demande rejetée");
        fetchRequests();
        fetchShopCategories();
      } else {
        toast.error(d.error || "Erreur lors du traitement");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  // Tree Node Renderer Component
  const TreeNode = ({ node }: { node: CategoryNode }) => {
    const isExpanded = expandedNodes[node.id] ?? false;
    const hasChildren = node.children && node.children.length > 0;
    const cfg = (node.pageConfig as any) || {};
    const status = cfg.status || "PUBLISHED";
    const isFeatured = cfg.isFeatured || false;
    const isHomepage = cfg.showOnHomepage ?? true;
    const isSelected = selectedCategoryIds.includes(node.id);
    const depth = node.depth || 0;

    return (
      <div className="flex flex-col border-b border-slate-100 last:border-b-0">
        <div
          className={`flex items-center gap-3 py-3 px-4 transition-colors hover:bg-slate-50/80 group ${
            isSelected ? "bg-emerald-50/50" : ""
          }`}
          style={{ paddingLeft: `${16 + depth * 28}px` }}
        >
          {/* Depth Indent Line Indicator */}
          {depth > 0 && (
            <div className="flex items-center text-slate-300 -ml-4 mr-1">
              <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}

          {/* Checkbox for bulk actions */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCategoryIds((prev) => [...prev, node.id]);
              } else {
                setSelectedCategoryIds((prev) => prev.filter((id) => id !== node.id));
              }
            }}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
          />

          {/* Expand/Collapse Chevron */}
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            </div>
          )}

          {/* Thumbnail / Icon */}
          <div className="relative w-9 h-9 rounded-xl border border-slate-200 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
            {node.image ? (
              <Image src={node.image} alt={node.name} fill className="object-cover" sizes="36px" />
            ) : cfg.icon ? (
              <span className="text-base">{cfg.icon}</span>
            ) : (
              <FolderOpen className="w-4 h-4 text-emerald-600 opacity-60" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 truncate">{node.name}</span>
              {node.parentId && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Sous-catégorie
                </span>
              )}
              {isFeatured && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Vedette
                </span>
              )}
              {isHomepage && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Accueil
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
              <span>/{node.slug}</span>
              <span>•</span>
              <span className="text-slate-600 font-sans font-medium flex items-center gap-1">
                <Package className="w-3 h-3 text-slate-400" />
                {node._count?.products || 0} produit(s)
              </span>
              {hasChildren && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 font-sans">
                    {node.children?.length} sous-branche(s)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden sm:block">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : status === "DRAFT"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Visual Builder Link */}
            <Link
              href={`/admin/cms/categories/${node.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
              title="Ouvrir le Category Visual Studio"
            >
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span className="hidden md:inline">Visual Studio</span>
            </Link>

            {/* Add Subcategory */}
            <button
              onClick={() => openCreateModal(node)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Ajouter une sous-catégorie sous cette branche"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Quick Edit */}
            <button
              onClick={() => openEditModal(node)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Modification rapide (Nom, image, statut)"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => promptDeleteCategory(node)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              title="Supprimer la catégorie en toute sécurité"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Render Nested Children if Expanded */}
        {hasChildren && isExpanded && (
          <div className="bg-slate-50/30">
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Title Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  NexMart Master Taxonomy Engine
                </span>
                {isSuperAdmin && (
                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                    Super Admin Authority
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Gestionnaire Maître des Catégories
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Contrôle centralisé et hiérarchique de l&apos;arborescence officielle NexMart Shop et Food.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Créer une Catégorie</span>
              </button>
            </div>
          </div>

          {/* Context Selector Tabs */}
          <div className="flex border-b border-slate-200 mt-6 space-x-2">
            {[
              { id: "shop", label: `NexMart Shop (${Array.isArray(categories) ? categories.length : 0})`, icon: Store },
              { id: "requests", label: `Demandes Vendeurs (${requests.length})`, icon: Clock },
              { id: "audit", label: "Journal d'Audit", icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = context === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setContext(tab.id as CatalogContext)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    active
                      ? "border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-t-lg"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* DUPLICATE CATEGORY ALERT BANNER */}
        {(duplicates.duplicateNames.length > 0 || duplicates.duplicateSlugs.length > 0) && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Doublons potentiels détectés dans la taxonomie :</p>
              {duplicates.duplicateNames.length > 0 && (
                <p className="mt-0.5">
                  Noms en double : <span className="font-mono font-semibold">{duplicates.duplicateNames.join(", ")}</span>
                </p>
              )}
              {duplicates.duplicateSlugs.length > 0 && (
                <p className="mt-0.5">
                  Slugs en double : <span className="font-mono font-semibold">{duplicates.duplicateSlugs.join(", ")}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 1: SHOP CATEGORIES ─── */}
        {context === "shop" && (
          <div className="space-y-4">
            {/* Filter and Control Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, slug ou description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="ARCHIVED">Archivée</option>
                </select>

                {/* Refresh */}
                <button
                  onClick={fetchShopCategories}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
                  title="Rafraîchir"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingShop ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* View Switcher & Expand All */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allExp: Record<string, boolean> = {};
                    Array.isArray(categories) && categories.forEach((c) => (allExp[c.id] = true));
                    setExpandedNodes(allExp);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Déplier tout
                </button>

                <button
                  onClick={() => setExpandedNodes({})}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Replier tout
                </button>

                <div className="h-5 w-px bg-slate-200 mx-1"></div>

                <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode("tree")}
                    className={`p-1.5 rounded-md text-xs font-bold transition-all ${
                      viewMode === "tree" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500"
                    }`}
                    title="Vue Arborescence Hiérarchique"
                  >
                    <ListTree className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md text-xs font-bold transition-all ${
                      viewMode === "grid" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500"
                    }`}
                    title="Vue Grille Triable"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar (if any selected) */}
            {selectedCategoryIds.length > 0 && (
              <div className="bg-emerald-900 text-white p-3 rounded-2xl flex items-center justify-between gap-4 shadow-md text-xs">
                <span className="font-semibold">
                  {selectedCategoryIds.length} catégorie(s) sélectionnée(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction("publish")}
                    disabled={bulkActionBusy}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 rounded-lg font-bold"
                  >
                    Publier
                  </button>
                  <button
                    onClick={() => handleBulkAction("unpublish")}
                    disabled={bulkActionBusy}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 rounded-lg font-bold"
                  >
                    Dépublier (Brouillon)
                  </button>
                  <button
                    onClick={() => setSelectedCategoryIds([])}
                    className="px-2 py-1.5 text-emerald-200 hover:text-white"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Content: Tree vs Grid */}
            {loadingShop ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                Chargement de la taxonomie officielle...
              </div>
            ) : viewMode === "tree" ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-[11px] font-bold uppercase text-slate-500 flex items-center justify-between">
                  <span>Arborescence des Catégories & Sous-Catégories</span>
                  <span>{categoryTree.length} branches racines</span>
                </div>

                {categoryTree.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    Aucune catégorie ne correspond aux critères de filtre.
                  </div>
                ) : (
                  <div>
                    {categoryTree.map((rootNode) => (
                      <TreeNode key={rootNode.id} node={rootNode} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Sortable Grid / List Mode with DnD Kit */
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={Array.isArray(categories) ? categories.map((c) => c.id) : []} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(categories) ? categories.map((cat) => (
                      <SortableCard
                        key={cat.id}
                        category={cat}
                        onEdit={openEditModal}
                        onDelete={promptDeleteCategory}
                      />
                    )) : null}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* ─── TAB 2: SELLER REQUESTS ─── */}
        {context === "requests" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Demandes de Création Soumises par les Vendeurs</h3>
                <p className="text-xs text-slate-500">
                  Les vendeurs ne peuvent pas publier directement de catégories officielles. Le Super Admin valide chaque demande.
                </p>
              </div>
              <button onClick={fetchRequests} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRequests ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingRequests ? (
              <div className="p-12 text-center text-xs text-slate-500">Chargement des demandes...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600 opacity-40" />
                <p className="font-semibold text-slate-700">Aucune demande vendeur en attente.</p>
                <p className="mt-1">Toutes les propositions ont été traitées.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {Array.isArray(requests) ? requests.map((req) => {
                  const cfg = (req.pageConfig as any) || {};
                  return (
                    <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{req.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">({req.slug})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{req.description || "Pas de description"}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span>Demandé par : <strong className="text-slate-700">{cfg.requestedByUserEmail || "Vendeur"}</strong></span>
                          <span>•</span>
                          <span>Date : {cfg.requestedAt ? new Date(cfg.requestedAt).toLocaleDateString() : "N/A"}</span>
                          {cfg.requestReason && (
                            <>
                              <span>•</span>
                              <span>Raison : &quot;{cfg.requestReason}&quot;</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewRequest(req.id, "approve")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Approuver & Publier
                        </button>
                        <button
                          onClick={() => handleReviewRequest(req.id, "reject")}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-colors"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  );
                }) : null}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: AUDIT LOGS ─── */}
        {context === "audit" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Journal d&apos;Audit des Catégories</h3>
                <p className="text-xs text-slate-500">
                  Toutes les opérations sensibles (création, mise à jour, réassignation, suppression) sont tracées ici.
                </p>
              </div>
              <button onClick={fetchAuditLogs} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingAudit ? (
              <div className="p-12 text-center text-xs text-slate-500">Chargement du journal d&apos;audit...</div>
            ) : !Array.isArray(auditLogs) || auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">Aucun événement enregistré.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.metadata && (
                      <pre className="text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 overflow-x-auto font-mono mt-1">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODAL: CREATE / QUICK EDIT CATEGORY ─── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                  {modalMode === "create" ? "Créer une Nouvelle Catégorie" : "Modifier la Catégorie"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalForm.name}
                  onChange={(e) => {
                    const n = e.target.value;
                    setModalForm((prev) => ({
                      ...prev,
                      name: n,
                      slug: modalMode === "create" ? slugifyCategory(n) : prev.slug,
                    }));
                  }}
                  placeholder="ex: Montres & Haute Joaillerie"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL</label>
                <input
                  type="text"
                  value={modalForm.slug}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, slug: slugifyCategory(e.target.value) }))}
                  placeholder="ex: montres-haute-joaillerie"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie Parente</label>
                <select
                  value={modalForm.parentId || ""}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, parentId: e.target.value || null }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">(Aucune - Catégorie Principale Racine)</option>
                  {Array.isArray(categories) && categories
                    .filter((c) => c.id !== editingId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parentId ? "↳ " : "📁 "} {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={modalForm.description}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image de la Catégorie</label>
                <MediaPicker
                  value={modalForm.image}
                  onChange={(url) => setModalForm((prev) => ({ ...prev, image: url }))}
                  label="Sélectionner depuis la médiathèque"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bannière Accueil (optionnel)</label>
                <MediaPicker
                  value={modalForm.bannerImage}
                  onChange={(url) => setModalForm((prev) => ({ ...prev, bannerImage: url }))}
                  label="Image spécifique pour l'accueil"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Icône (emoji ou texte)</label>
                <input
                  type="text"
                  value={modalForm.icon}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="ex: 🛍️"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ordre d'affichage</label>
                <input
                  type="number"
                  value={modalForm.order}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Statut</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                  >
                    <option value="PUBLISHED">Publiée</option>
                    <option value="DRAFT">Brouillon</option>
                    <option value="ARCHIVED">Archivée</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={modalForm.showOnHomepage}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, showOnHomepage: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Visible sur Accueil</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={modalForm.isFeatured}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>En Vedette (Featured)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  disabled={savingCategory}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  {savingCategory ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: SAFE CATEGORY DELETION ─── */}
      <AnimatePresence>
        {deleteModalOpen && categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Suppression Sécurisée de Catégorie</h3>
                  <p className="text-xs text-slate-500">{categoryToDelete.name}</p>
                </div>
              </div>

              {(categoryToDelete._count?.products || 0) > 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <p className="font-bold">
                    ⚠️ Cette catégorie contient {categoryToDelete._count?.products} produit(s).
                  </p>
                  <p>
                    Pour préserver l&apos;intégrité du catalogue, vous devez réassigner ses produits ou choisir l&apos;archivage.
                  </p>

                  <div className="pt-1">
                    <label className="block text-[11px] font-bold mb-1">
                      Réassigner les produits vers :
                    </label>
                    <select
                      value={reassignTargetId}
                      onChange={(e) => setReassignTargetId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white text-slate-800"
                    >
                      <option value="">-- Choisir une catégorie cible --</option>
                      {categories
                        .filter((c) => c.id !== categoryToDelete.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600">
                  Cette catégorie ne contient aucun produit. Sa suppression sera immédiate et définitive.
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>

                {(categoryToDelete._count?.products || 0) > 0 && (
                  <button
                    type="button"
                    disabled={deletingBusy}
                    onClick={() => handleExecuteDelete(true)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
                  >
                    Archiver la catégorie
                  </button>
                )}

                <button
                  type="button"
                  disabled={deletingBusy || ((categoryToDelete._count?.products || 0) > 0 && !reassignTargetId)}
                  onClick={() => handleExecuteDelete(false)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {deletingBusy ? "Traitement..." : "Supprimer définitivement"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Sortable Grid Item
function SortableCard({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryNode;
  onEdit: (cat: CategoryNode) => void;
  onDelete: (cat: CategoryNode) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cfg = (category.pageConfig as any) || {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden group shadow-2xs hover:shadow-md transition-shadow"
    >
      <div className="relative h-28 bg-slate-100">
        {category.image ? (
          <Image src={category.image} alt={category.name} fill className="object-cover" sizes="300px" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <FolderOpen className="w-8 h-8 opacity-40 text-emerald-600" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {category.parentId && (
            <span className="text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-700 px-2 py-0.5 rounded-full shadow-xs">
              Sous-catégorie
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{category.name}</h4>
              <p className="text-[11px] font-mono text-slate-400">/{category.slug}</p>
            </div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
          <span>{category._count?.products || 0} produit(s)</span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {cfg.status || "PUBLISHED"}
          </span>
        </div>

        <Link
          href={`/admin/cms/categories/${category.id}`}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          <span>Ouvrir dans Visual Studio</span>
        </Link>
      </div>
    </div>
  );
}
