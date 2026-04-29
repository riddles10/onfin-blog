'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

/* Extend TipTap's Image extension with an `align` attribute so authors can
 * float images left/right or center them. Renders as `data-align` plus a
 * `blog-img blog-img-{left|center|right}` class — the CSS in globals.css
 * picks up both .ProseMirror (editor) and .prose (published page) so
 * editor view = published view. */
const AlignableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          const align = attributes.align || 'center'
          return {
            'data-align': align,
            class: `blog-img blog-img-${align}`,
          }
        },
      },
    }
  },
})

type Props = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [imageSelected, setImageSelected] = useState(false)
  const [selectedAlt, setSelectedAlt] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
      AlignableImage,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive('image')) {
        setImageSelected(true)
        setSelectedAlt(editor.getAttributes('image').alt || '')
      } else {
        setImageSelected(false)
        setSelectedAlt('')
      }
    },
    editorProps: {
      attributes: {
        class: 'max-w-none min-h-[300px] px-4 py-3 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (content !== current) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) return null

  const openFilePicker = () => {
    if (uploading) return
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif']
    if (!ALLOWED_MIME.includes(file.type)) {
      alert('Only JPG, PNG, and GIF images are supported.')
      return
    }
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      alert('Image must be under 10 MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data.url) {
        alert(data.error || 'Upload failed')
        return
      }
      editor.chain().focus().setImage({ src: data.url, alt: '' }).run()
    } catch (err) {
      console.error('Image upload failed:', err)
      alert('Upload failed — check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  const setImageAlign = (align: 'left' | 'center' | 'right') => {
    editor.chain().focus().updateAttributes('image', { align }).run()
  }

  const setImageAlt = (alt: string) => {
    setSelectedAlt(alt)
    editor.chain().updateAttributes('image', { alt }).run()
  }

  const deleteImage = () => {
    editor.chain().focus().deleteSelection().run()
  }

  const addLink = () => {
    const url = prompt('Link URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const currentAlign = imageSelected
    ? (editor.getAttributes('image').align as string) || 'center'
    : null

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Main toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
          className="font-bold"
        />
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
          className="italic"
        />
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label="S"
          className="line-through"
        />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="H2"
        />
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="H3"
        />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="&bull; List"
        />
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="1. List"
        />
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="&ldquo; Quote"
        />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton
          active={editor.isActive('link')}
          onClick={addLink}
          label="Link"
        />
        <ToolbarButton
          active={false}
          onClick={openFilePicker}
          label={uploading ? 'Uploading&hellip;' : 'Image'}
          disabled={uploading}
        />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          label="Code"
        />
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="&mdash;"
        />
      </div>

      {/* Image context toolbar */}
      {imageSelected && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-100">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Image
          </span>
          <div className="flex items-center gap-1">
            <ToolbarButton
              active={currentAlign === 'left'}
              onClick={() => setImageAlign('left')}
              label="&larr; Left"
            />
            <ToolbarButton
              active={currentAlign === 'center'}
              onClick={() => setImageAlign('center')}
              label="&middot; Center"
            />
            <ToolbarButton
              active={currentAlign === 'right'}
              onClick={() => setImageAlign('right')}
              label="Right &rarr;"
            />
          </div>
          <div className="w-px h-5 bg-gray-300" />
          <label className="flex items-center gap-2 flex-1 min-w-[220px]">
            <span className="text-xs text-gray-600 whitespace-nowrap">Alt text:</span>
            <input
              type="text"
              value={selectedAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe this image (accessibility & SEO)"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
            />
          </label>
          <div className="w-px h-5 bg-gray-300" />
          <button
            type="button"
            onClick={deleteImage}
            className="px-2 py-1 text-xs rounded text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  active,
  onClick,
  label,
  className,
  disabled,
}: {
  active: boolean
  onClick: () => void
  label: string
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 text-xs rounded transition-colors ${className || ''} ${
        disabled
          ? 'text-gray-400 cursor-not-allowed'
          : active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
      dangerouslySetInnerHTML={{ __html: label }}
    />
  )
}
