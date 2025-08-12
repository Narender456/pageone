"use client"
import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/select"
import {
  Eye,
  Code,
  Save,
  Undo,
  Redo,
  Trash2,
  Settings,
  Menu,
  LayoutGrid,
  Loader2,
  Monitor,
  Tablet,
  Smartphone
} from "lucide-react"
import { pagesApi } from "../../../lib/pages-api" 
import { useToast } from "../../../hooks/use-toast"

// Import Puck
import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"

// Define Puck configuration with components
const config = {
  components: {
    Hero: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        image: { type: "text" },
        buttonText: { type: "text" },
        buttonLink: { type: "text" }
      },
      defaultProps: {
        title: "Welcome to Our Site",
        description: "This is a hero section description",
        image: "",
        buttonText: "Get Started",
        buttonLink: "#"
      },
      render: ({ title, description, image, buttonText, buttonLink }) => (
        <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            {image && (
              <img src={image} alt={title} className="mx-auto mb-8 max-w-md rounded-lg shadow-lg" />
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">{description}</p>
            {buttonText && (
              <a
                href={buttonLink}
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {buttonText}
              </a>
            )}
          </div>
        </section>
      )
    },
    Text: {
      fields: {
        content: { type: "textarea" },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" }
          ]
        },
        size: {
          type: "select",
          options: [
            { label: "Small", value: "text-sm" },
            { label: "Medium", value: "text-base" },
            { label: "Large", value: "text-lg" },
            { label: "Extra Large", value: "text-xl" }
          ]
        }
      },
      defaultProps: {
        content: "Enter your text here...",
        align: "left",
        size: "text-base"
      },
      render: ({ content, align, size }) => (
        <div className={`p-4 text-${align}`}>
          <p className={size}>{content}</p>
        </div>
      )
    },
    Button: {
      fields: {
        text: { type: "text" },
        link: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" }
          ]
        },
        size: {
          type: "select",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" }
          ]
        }
      },
      defaultProps: {
        text: "Click me",
        link: "#",
        variant: "primary",
        size: "md"
      },
      render: ({ text, link, variant, size }) => {
        const baseClasses = "inline-block px-6 py-2 rounded-lg font-semibold transition-colors"
        const variantClasses = {
          primary: "bg-blue-600 text-white hover:bg-blue-700",
          secondary: "bg-gray-600 text-white hover:bg-gray-700",
          outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        }
        const sizeClasses = {
          sm: "px-4 py-1 text-sm",
          md: "px-6 py-2",
          lg: "px-8 py-3 text-lg"
        }

        return (
          <div className="p-4">
            <a
              href={link}
              className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
            >
              {text}
            </a>
          </div>
        )
      }
    },
    Card: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        image: { type: "text" },
        buttonText: { type: "text" },
        buttonLink: { type: "text" }
      },
      defaultProps: {
        title: "Card Title",
        description: "Card description goes here...",
        image: "",
        buttonText: "Learn More",
        buttonLink: "#"
      },
      render: ({ title, description, image, buttonText, buttonLink }) => (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden m-4 max-w-sm">
          {image && (
            <img src={image} alt={title} className="w-full h-48 object-cover" />
          )}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            {buttonText && (
              <a
                href={buttonLink}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {buttonText}
              </a>
            )}
          </div>
        </div>
      )
    },
    Container: {
      fields: {
        maxWidth: {
          type: "select",
          options: [
            { label: "Small", value: "max-w-2xl" },
            { label: "Medium", value: "max-w-4xl" },
            { label: "Large", value: "max-w-6xl" },
            { label: "Full", value: "max-w-full" }
          ]
        },
        padding: {
          type: "select",
          options: [
            { label: "None", value: "p-0" },
            { label: "Small", value: "p-4" },
            { label: "Medium", value: "p-8" },
            { label: "Large", value: "p-12" }
          ]
        }
      },
      defaultProps: {
        maxWidth: "max-w-4xl",
        padding: "p-8"
      },
      render: ({ maxWidth, padding, puck: { renderDropZone } }) => (
        <div className={`mx-auto ${maxWidth} ${padding}`}>
          {renderDropZone({ zone: "content" })}
        </div>
      )
    },
    Columns: {
      fields: {
        columns: {
          type: "select",
          options: [
            { label: "2 Columns", value: 2 },
            { label: "3 Columns", value: 3 },
            { label: "4 Columns", value: 4 }
          ]
        },
        gap: {
          type: "select",
          options: [
            { label: "Small", value: "gap-4" },
            { label: "Medium", value: "gap-8" },
            { label: "Large", value: "gap-12" }
          ]
        }
      },
      defaultProps: {
        columns: 2,
        gap: "gap-8"
      },
      render: ({ columns, gap, puck: { renderDropZone } }) => (
        <div className={`grid grid-cols-${columns} ${gap} p-4`}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="min-h-24 border-2 border-dashed border-gray-300 rounded">
              {renderDropZone({ zone: `column-${i}` })}
            </div>
          ))}
        </div>
      )
    }
  }
}

export default function PageEditorPage() {
  const params = useParams()
  const slug = params.slug
  const [pageData, setPageData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [device, setDevice] = useState("Desktop")
  const [isPreview, setIsPreview] = useState(false)
  const [puckData, setPuckData] = useState({ content: [], root: {} })
  const { toast } = useToast()

  // Load page data
  useEffect(() => {
    const fetchPageData = async () => {
      if (!slug) return

      try {
        setIsLoading(true)
        const response = await pagesApi.loadPage(slug)
        if (response.success) {
          setPageData(response.data)
          // Load Puck data from the response
          if (response.data.puckData) {
            setPuckData(response.data.puckData)
          } else if (response.data.components) {
            // Convert old GrapesJS data to Puck format if needed
            setPuckData({
              content: response.data.components || [],
              root: {}
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load page data.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error fetching page data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading page data.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPageData()
  }, [slug, toast])

  // Save page data
  const handleSave = async () => {
    if (!pageData) return

    setIsSaving(true)
    try {
      const response = await pagesApi.savePage({
        slug: slug,
        form_title: pageData?.title || "Untitled Page",
        form_category: pageData?.form?.category || "Uncategorized",
        puckData: puckData,
        form_content: pageData?.form?.content || {}
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Page saved successfully!"
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to save page.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error saving page:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the page.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Device icon mapping
  const deviceIcons = {
    Desktop: Monitor,
    Tablet: Tablet,
    Mobile: Smartphone
  }

  // Device viewport sizes
  const deviceSizes = {
    Desktop: "100%",
    Tablet: "768px",
    Mobile: "375px"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading editor...</span>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        Page not found or could not be loaded.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-gray-800 text-white p-3 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-700 rounded-md px-3 py-2">
            <span className="text-sm mr-2">Device:</span>
            <Select value={device} onValueChange={setDevice}>
              <SelectTrigger className="w-[130px] h-8 bg-gray-600 text-white border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white border-gray-600">
                {Object.entries(deviceIcons).map(([deviceName, Icon]) => (
                  <SelectItem key={deviceName} value={deviceName}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{deviceName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-lg font-semibold">{pageData.title} Editor</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-700"
            title="Save Page"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            onClick={() => setIsPreview(!isPreview)}
            variant="ghost"
            size="icon"
            className={`text-white hover:bg-gray-700 ${isPreview ? 'bg-blue-600' : ''}`}
            title="Toggle Preview"
          >
            <Eye className="h-5 w-5" />
          </Button>

          <div className="text-sm bg-gray-700 px-3 py-1 rounded">
            {isPreview ? "Preview Mode" : "Edit Mode"}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full mx-auto transition-all duration-300 bg-white shadow-lg"
          style={{ 
            width: device === "Desktop" ? "100%" : deviceSizes[device],
            minHeight: "100%"
          }}
        >
          <Puck
            config={config}
            data={puckData}
            onPublish={setPuckData}
            onChange={setPuckData}
            renderRoot={({ children }) => (
              <div className="min-h-screen">
                {children}
              </div>
            )}
            headerShow={false}
            sidebarShow={!isPreview}
            iframe={{
              enabled: device !== "Desktop"
            }}
          />
        </div>
      </div>

      {/* Custom Styles for Puck */}
      <style jsx global>{`
        .Puck {
          --puck-color-primary: #3b82f6;
          --puck-color-primary-light: #dbeafe;
          height: 100%;
        }
        
        .Puck-portal {
          z-index: 9999;
        }
        
        .Puck-frame {
          border: none !important;
        }
        
        ${device !== "Desktop" ? `
          .Puck-preview {
            max-width: ${deviceSizes[device]} !important;
            margin: 0 auto;
          }
        ` : ''}
      `}</style>
    </div>
  )
}