"use client"

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SectionVisibilityToggleProps {
  sectionId: string
  sectionType: string
  initialIsVisible: boolean
  initialIsPublished: boolean
  onUpdate?: (data: { isVisible: boolean; isPublished: boolean }) => void
}

export function SectionVisibilityToggle({
  sectionId,
  sectionType,
  initialIsVisible,
  initialIsPublished,
  onUpdate
}: SectionVisibilityToggleProps) {
  const [isVisible, setIsVisible] = useState(initialIsVisible)
  const [isPublished, setIsPublished] = useState(initialIsPublished)
  const [isSaving, setIsSaving] = useState(false)

  const handleVisibilityChange = async (value: boolean) => {
    setIsVisible(value)
    await saveChanges({ isVisible: value, isPublished })
  }

  const handlePublishChange = async (value: boolean) => {
    setIsPublished(value)
    await saveChanges({ isVisible, isPublished: value })
  }

  const saveChanges = async (data: { isVisible: boolean; isPublished: boolean }) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionType,
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update section')
      }

      const updated = await response.json()
      onUpdate?.(data)
      toast.success('Section updated successfully')
    } catch (error) {
      console.error('Error updating section:', error)
      toast.error('Failed to update section')
      // Revert state on error
      setIsVisible(initialIsVisible)
      setIsPublished(initialIsPublished)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isVisible ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm font-medium">Visibility</span>
          </div>
          <Switch
            checked={isVisible}
            onCheckedChange={handleVisibilityChange}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Published</span>
          </div>
          <Switch
            checked={isPublished}
            onCheckedChange={handlePublishChange}
            disabled={isSaving}
          />
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        disabled={isSaving}
        onClick={() => saveChanges({ isVisible, isPublished })}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
