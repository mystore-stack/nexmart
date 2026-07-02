import { useState, useCallback, useRef, useEffect } from "react";

interface AutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  debounceMs?: number;
  enabled?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>({ data, onSave, debounceMs = 2000, enabled = true }: AutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const previousDataRef = useRef<T>(data);

  const triggerSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus("saving");
    setError(null);

    try {
      await onSave(data);
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      previousDataRef.current = data;
    } catch (err) {
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : "Save failed");
      // Retry after 5 seconds on error
      setTimeout(() => {
        if (hasUnsavedChanges) {
          triggerSave();
        }
      }, 5000);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, hasUnsavedChanges]);

  const scheduleSave = useCallback(() => {
    if (!enabled) return;

    setHasUnsavedChanges(true);
    setSaveStatus("idle");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      triggerSave();
    }, debounceMs);
  }, [enabled, debounceMs, triggerSave]);

  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await triggerSave();
  }, [triggerSave]);

  // Detect data changes and schedule auto-save
  useEffect(() => {
    if (!enabled) return;

    // Check if data actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged) {
      scheduleSave();
    }
  }, [data, enabled, scheduleSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && saveStatus !== "saved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, saveStatus]);

  return {
    saveStatus,
    hasUnsavedChanges,
    lastSavedAt,
    error,
    saveNow,
    isSaving: saveStatus === "saving",
    isSaved: saveStatus === "saved",
    hasError: saveStatus === "error",
  };
}
