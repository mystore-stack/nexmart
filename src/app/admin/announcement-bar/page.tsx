"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Eye, EyeOff, ArrowUp, ArrowDown, Save, Bell } from "lucide-react";
import toast from "react-hot-toast";

const announcementBarSchema = z.object({
  text: z.string().min(1, "Text is required"),
  icon: z.string().optional(),
  backgroundColor: z.string().default("#000000"),
  textColor: z.string().default("#ffffff"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type AnnouncementBarFormData = z.infer<typeof announcementBarSchema>;

interface AnnouncementBar {
  id: string;
  text: string;
  icon?: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

const defaultValues: AnnouncementBarFormData = {
  text: "",
  icon: "",
  backgroundColor: "#000000",
  textColor: "#ffffff",
  isActive: true,
  displayOrder: 0,
  startDate: "",
  endDate: "",
};

export default function AnnouncementBarCMSPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AnnouncementBarFormData>({
    resolver: zodResolver(announcementBarSchema),
    defaultValues,
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcement-bar");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: AnnouncementBarFormData) => {
    setSaving(true);
    try {
      const url = editId ? `/api/admin/announcement-bar/${editId}` : "/api/admin/announcement-bar";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (responseData.success) {
        if (editId) {
          setAnnouncements((prev) => prev.map((a) => a.id === editId ? responseData.announcement : a));
          toast.success("Announcement updated!");
        } else {
          setAnnouncements((prev) => [...prev, responseData.announcement]);
          toast.success("Announcement created!");
        }
        setShowForm(false);
        reset(defaultValues);
        setEditId(null);
      } else {
        toast.error(responseData.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcement-bar/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        toast.success("Announcement deleted");
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcement-bar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => prev.map((a) => a.id === id ? data.announcement : a));
        toast.success(isActive ? "Announcement deactivated" : "Announcement activated");
      }
    } catch (error) {
      toast.error("Failed to update announcement");
    }
  };

  const reorderAnnouncement = async (id: string, direction: "up" | "down") => {
    const currentIndex = announcements.findIndex((a) => a.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= announcements.length) return;

    const newAnnouncements = [...announcements];
    const [movedAnnouncement] = newAnnouncements.splice(currentIndex, 1);
    newAnnouncements.splice(newIndex, 0, movedAnnouncement);

    // Update display orders
    const updates = newAnnouncements.map((announcement, index) => ({
      id: announcement.id,
      displayOrder: index,
    }));

    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/admin/announcement-bar/${update.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayOrder: update.displayOrder }),
          })
        )
      );
      setAnnouncements(newAnnouncements);
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const editAnnouncement = (announcement: AnnouncementBar) => {
    reset({
      text: announcement.text,
      icon: announcement.icon || "",
      backgroundColor: announcement.backgroundColor,
      textColor: announcement.textColor,
      isActive: announcement.isActive,
      displayOrder: announcement.displayOrder,
      startDate: announcement.startDate || "",
      endDate: announcement.endDate || "",
    });
    setEditId(announcement.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcement Bar</h1>
          <p className="text-muted-foreground text-sm mt-1">{announcements.length} announcements</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            reset(defaultValues);
          }}
          className="btn-primary py-2.5 px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Preview */}
                <div
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: announcement.backgroundColor,
                    color: announcement.textColor,
                  }}
                >
                  {announcement.icon && <span className="mr-2">{announcement.icon}</span>}
                  {announcement.text}
                </div>

                {/* Order Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => reorderAnnouncement(announcement.id, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => reorderAnnouncement(announcement.id, "down")}
                    disabled={index === announcements.length - 1}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(announcement.id, announcement.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    announcement.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                  title={announcement.isActive ? "Active" : "Inactive"}
                >
                  {announcement.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => editAnnouncement(announcement)}
                  className="p-2 rounded-lg hover:bg-accent"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {announcement.isActive && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                Active
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !saving && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold">{editId ? "Edit Announcement" : "New Announcement"}</h2>
                <button
                  onClick={() => !saving && setShowForm(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleSave)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Text *</label>
                  <input
                    {...register("text")}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Free shipping on orders over 500 MAD"
                  />
                  {errors.text && <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Optional)</label>
                  <input
                    {...register("icon")}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 🚚 or use emoji"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        {...register("backgroundColor")}
                        type="color"
                        className="w-12 h-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        {...register("backgroundColor")}
                        type="text"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        {...register("textColor")}
                        type="color"
                        className="w-12 h-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        {...register("textColor")}
                        type="text"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date (Optional)</label>
                    <input
                      {...register("startDate")}
                      type="datetime-local"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                    <input
                      {...register("endDate")}
                      type="datetime-local"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => !saving && setShowForm(false)}
                    className="btn-secondary py-2 px-4"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-4"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
