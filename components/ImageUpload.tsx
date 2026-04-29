'use client'

import { useState, useRef, useCallback } from 'react'

type ImageUploadProps = {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  label?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function ImageUpload({ images, onChange, maxImages = 6, label = 'Images' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Max 5MB.')
      return null
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return null
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Upload failed')
      return null
    }

    const data = await res.json()
    return data.url
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)
    const remaining = maxImages - images.length
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed.`)
      return
    }
    const toUpload = fileArray.slice(0, remaining)

    setUploading(true)
    try {
      const results = await Promise.all(toUpload.map(uploadFile))
      const urls = results.filter((url): url is string => url !== null)
      if (urls.length > 0) {
        onChange([...images, ...urls])
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {images.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove image"
              >
                &times;
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-heading font-semibold uppercase px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-3 text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              <span className="font-heading text-sm">Uploading...</span>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
              </svg>
              <p className="text-sm text-gray-500 font-heading">Click or drag images to upload</p>
              <p className="text-xs text-gray-400 mt-1">
                {images.length}/{maxImages} &middot; Max 5MB per file
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  )
}
