"use client"

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { normalizeToCanonicalKey } from '@/lib/homepage/canonical-contract';
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'

interface Section {
  id: string
  title?: string
  type: string
  isVisible: boolean
  isPublished: boolean
  displayOrder: number
  [key: string]: any
}

interface SectionDragDropListProps {
  sections: Section[]
  sectionType: string
  onReorder: (sections: Section[]) => void
  onVisibilityChange?: (id: string, isVisible: boolean) => void
  onPublishChange?: (id: string, isPublished: boolean) => void
}

function SortableSection({
  section,
  sectionType,
  onVisibilityChange,
  onPublishChange,
}: {
  section: Section
  sectionType: string
  onVisibilityChange?: (id: string, isVisible: boolean) => void
  onPublishChange?: (id: string, isPublished: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleVisibilityToggle = async (value: boolean) => {
    try {
      const response = await fetch(`/api/admin/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType,
          isVisible: value,
        }),
      })

      if (!response.ok) throw new Error('Failed to update')
      
      onVisibilityChange?.(section.id, value)
      toast.success('Visibility updated')
    } catch (error) {
      toast.error('Failed to update visibility')
    }
  }

  const handlePublishToggle = async (value: boolean) => {
    try {
      const response = await fetch(`/api/admin/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType,
          isPublished: value,
        }),
      })

      if (!response.ok) throw new Error('Failed to update')
      
      onPublishChange?.(section.id, value)
      toast.success('Publish status updated')
    } catch (error) {
      toast.error('Failed to update publish status')
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {section.title || normalizeToCanonicalKey(String(section.type)) || section.type}
        </p>
        <p className="text-xs text-gray-500">
          Order: {section.displayOrder}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Visible</span>
          <Switch
            checked={section.isVisible}
            onCheckedChange={handleVisibilityToggle}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Published</span>
          <Switch
            checked={section.isPublished}
            onCheckedChange={handlePublishToggle}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}

export function SectionDragDropList({
  sections,
  sectionType,
  onReorder,
  onVisibilityChange,
  onPublishChange,
}: SectionDragDropListProps) {
  const [items, setItems] = useState(sections)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      
      const newItems = arrayMove(items, oldIndex, newIndex)
      
      // Update displayOrder based on new position
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        displayOrder: index,
      }))

      setItems(updatedItems)
      onReorder(updatedItems)

      // Save to server
      setIsSaving(true)
      try {
        const response = await fetch('/api/admin/sections/bulk-order', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionType,
            sections: updatedItems.map((item) => ({
              id: item.id,
              displayOrder: item.displayOrder,
            })),
          }),
        })

        if (!response.ok) throw new Error('Failed to save order')
        
        toast.success('Order saved successfully')
      } catch (error) {
        toast.error('Failed to save order')
        // Revert on error
        setItems(items)
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Sections Order</h3>
        {isSaving && (
          <span className="text-xs text-gray-500">Saving...</span>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  sectionType={sectionType}
                  onVisibilityChange={onVisibilityChange}
                  onPublishChange={onPublishChange}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
