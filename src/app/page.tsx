'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { X, Heart, Star, Frown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
interface Font {
  family: string;
  category: string;
  files: {
    regular?: string;
    [key: string]: string | undefined;
  };
}

interface CategoryWeights {
  [category: string]: number;
}

export default function Home() {
  const [fonts, setFonts] = useState<Font[]>([])
  const [currentFontIndex, setCurrentFontIndex] = useState(0)
  const [keptFonts, setKeptFonts] = useState<string[]>([])
  const [customText, setCustomText] = useState("The quick brown fox jumps over the lazy dog")
  const [direction, setDirection] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showIcon, setShowIcon] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [categoryWeights, setCategoryWeights] = useState<CategoryWeights>({})
  const [headerFont, setHeaderFont] = useState<Font | null>(null)
  const [fontShowCount, setFontShowCount] = useState<{ [key: string]: number }>({})
  const [explorationMode, setExplorationMode] = useState(false)
  const [superLikedFonts, setSuperLikedFonts] = useState<string[]>([])

  const cardRef = useRef(null)

  useEffect(() => {
    fetchFonts()
    loadCategoryWeights()
  }, [])

  useEffect(() => {
    if (fonts.length > 0 && fonts[currentFontIndex]) {
      loadFont(fonts[currentFontIndex])
      updateFontShowCount(fonts[currentFontIndex].family)
    }
  }, [currentFontIndex, fonts])

  useEffect(() => {
    if (fonts.length > 0) {
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)]
      setHeaderFont(randomFont)
      loadFont(randomFont)
    }
  }, [fonts])

  const fetchFonts = async () => {
    try {
      const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyA16FApfQ02fPWzAocEtPC30lSs41FuyAg')
      const data = await response.json()

      const shuffledFonts = shuffleArray(data.items as Font[])

      setFonts(shuffledFonts)
      setCurrentFontIndex(0)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching fonts:', error)
      setFonts([])
      setCurrentFontIndex(0)
      setIsLoading(false)
    }
  }

  const loadFont = (font: Font) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(font.family)}&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const loadCategoryWeights = () => {
    const storedWeights = localStorage.getItem('categoryWeights')
    if (storedWeights) {
      setCategoryWeights(JSON.parse(storedWeights))
    }
  }

  const saveCategoryWeights = (weights: CategoryWeights) => {
    localStorage.setItem('categoryWeights', JSON.stringify(weights))
  }

  const clearWeights = () => {
    setCategoryWeights({})
    localStorage.removeItem('categoryWeights')
  }

  const updateCategoryWeight = (category: string, multiplier: number) => {
    setCategoryWeights(prevWeights => {
      const newWeights = { ...prevWeights }

      // Update the weight for the current category
      newWeights[category] = (newWeights[category] || 0) + multiplier

      // If skipping (negative multiplier), boost other categories slightly
      if (multiplier < 0) {
        Object.keys(newWeights).forEach(cat => {
          if (cat !== category) {
            newWeights[cat] = (newWeights[cat] || 0) + 0.5
          }
        })
      }

      saveCategoryWeights(newWeights)
      return newWeights
    })
  }

  const updateFontShowCount = (fontFamily: string) => {
    setFontShowCount(prevCount => {
      const newCount = { ...prevCount, [fontFamily]: (prevCount[fontFamily] || 0) + 1 }
      if (newCount[fontFamily] > 10) {
        setExplorationMode(true)
      }
      return newCount
    })
  }

  const getNextFontIndex = (currentIndex: number) => {
    let nextIndex = (currentIndex + 1) % fonts.length
    let attempts = 0

    while (
      (fontShowCount[fonts[nextIndex].family] || 0) > 10 &&
      attempts < fonts.length
    ) {
      nextIndex = (nextIndex + 1) % fonts.length
      attempts++
    }

    if (attempts === fonts.length) {
      setExplorationMode(true)
      return Math.floor(Math.random() * fonts.length)
    }

    return nextIndex
  }

  const handleKeep = useCallback((multiplier: number = 1) => {
    if (fonts.length > 0 && fonts[currentFontIndex]) {
      const currentFont = fonts[currentFontIndex].family
      setKeptFonts((prevKeptFonts) => {
        const newKeptFonts = prevKeptFonts.filter(font => font !== currentFont)
        return multiplier === 2
          ? [currentFont, ...newKeptFonts]
          : [...newKeptFonts, currentFont]
      })
      if (multiplier === 2) {
        setSuperLikedFonts(prev => [...prev, currentFont])
      }
      updateCategoryWeight(fonts[currentFontIndex].category, multiplier)
      setDirection('right')
      setShowIcon(multiplier === 2 ? 'superLike' : 'keep')
      setTimeout(() => {
        setCurrentFontIndex(getNextFontIndex(currentFontIndex))
        setDirection(null)
        setShowIcon(null)
      }, 300)
    } else {
      console.error('No fonts available or current font is undefined')
      fetchFonts()
    }
  }, [fonts, currentFontIndex, updateCategoryWeight, fetchFonts, getNextFontIndex])

  const handleSkip = useCallback((multiplier: number = 1) => {
    if (fonts.length > 0 && fonts[currentFontIndex]) {
      updateCategoryWeight(fonts[currentFontIndex].category, -multiplier)
      setDirection('left')
      setShowIcon(multiplier === 2 ? 'superHate' : 'skip')
      setTimeout(() => {
        setCurrentFontIndex(getNextFontIndex(currentFontIndex))
        setDirection(null)
        setShowIcon(null)
      }, 300)
    } else {
      console.error('No fonts available or current font is undefined')
      fetchFonts()
    }
  }, [fonts, currentFontIndex, updateCategoryWeight, fetchFonts, getNextFontIndex])

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const offset = eventData.deltaX
      setSwipeOffset(offset)
      if (offset > 75) {
        setShowIcon('keep')
      } else if (offset < -75) {
        setShowIcon('skip')
      } else {
        setShowIcon(null)
      }
    },
    onSwipedLeft: () => handleSkip(),
    onSwipedRight: () => handleKeep(),
    onSwiped: () => {
      setSwipeOffset(0)
      setShowIcon(null)
    },
    trackMouse: true,
    trackTouch: true,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.shiftKey ? handleSkip(2) : handleSkip(1)
      } else if (event.key === 'ArrowRight') {
        event.shiftKey ? handleKeep(2) : handleKeep(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeep, handleSkip])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading fonts...</div>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 relative">
      <header className="absolute top-0 left-0 right-0 bg-white shadow-md p-4 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-black"
            style={{ fontFamily: headerFont ? `'${headerFont.family}', sans-serif` : 'sans-serif' }}
          >
            helpineedafont.com
          </h1>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              {fonts.length} fonts loaded
            </Badge>
            <div className="">
              <Input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="text-black w-full w-[400px]"
                placeholder="Enter custom text..."
              />
            </div>
          </div>
        </div>
      </header>

      <div className="relative" {...handlers}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFontIndex}
            ref={cardRef}
            initial={{ opacity: 0, x: direction === 'left' ? 300 : direction === 'right' ? -300 : 0 }}
            animate={{ opacity: 1, x: swipeOffset }}
            exit={{ opacity: 0, x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-center bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full cursor-grab active:cursor-grabbing select-none text-black"
          >
            <h2 className="text-2xl font-semibold mb-4 pointer-events-none text-black">{fonts[currentFontIndex]?.family}</h2>
            <p
              className="text-5xl mb-8 pointer-events-none"
              style={{
                fontFamily: `'${fonts[currentFontIndex]?.family}', sans-serif`,
              }}
            >
              {customText}
            </p>
            <p className="text-gray-500 pointer-events-none">{fonts[currentFontIndex]?.category}</p>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {showIcon === 'keep' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 right-4 transform -translate-y-1/2"
            >
              <Heart className="h-16 w-16 text-green-500" />
            </motion.div>
          )}
          {showIcon === 'skip' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 left-4 transform -translate-y-1/2"
            >
              <X className="h-16 w-16 text-red-500" />
            </motion.div>
          )}
          {showIcon === 'superLike' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 right-4 transform -translate-y-1/2"
            >
              <Star className="h-16 w-16 text-yellow-500" />
            </motion.div>
          )}
          {showIcon === 'superHate' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 left-4 transform -translate-y-1/2"
            >
              <Frown className="h-16 w-16 text-red-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center space-x-4 mt-8">
        <Button onClick={() => handleSkip(2)} variant="outline" size="lg" className="rounded-full p-6">
          <Frown className="h-8 w-8 text-red-700" />
        </Button>
        <Button onClick={() => handleSkip(1)} variant="outline" size="lg" className="rounded-full p-6">
          <X className="h-8 w-8 text-red-500" />
        </Button>
        <Button onClick={() => handleKeep(1)} variant="outline" size="lg" className="rounded-full p-6">
          <Heart className="h-8 w-8 text-green-500" />
        </Button>
        <Button onClick={() => handleKeep(2)} variant="outline" size="lg" className="rounded-full p-6">
          <Star className="h-8 w-8 text-yellow-500" />
        </Button>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className="mt-4 text-black">
            <Button variant="outline" className="mt-4">Keyboard Legend</Button>
          </TooltipTrigger>
          <TooltipContent className="p-4">
            <p className="mb-2"><strong>←</strong> Skip</p>
            <p className="mb-2"><strong>→</strong> Keep</p>
            <p className="mb-2"><strong>Shift + ←</strong> Super Hate</p>
            <p><strong>Shift + →</strong> Super Like</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Card className="absolute bottom-4 right-4 p-4 max-w-xs w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">Kept Fonts:</h2>
        <ScrollArea className="h-[200px]  rounded-md border p-4">
          <ul className="list-disc list-inside mb-4">
            {keptFonts.map((font, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                <TooltipTrigger asChild>
                    <li
                      className="text-sm flex items-center cursor-pointer bg-gray-100 p-1 rounded mb-1"
                      style={{ fontFamily: `'${font}', sans-serif` }}
                    >
                      {superLikedFonts.includes(font) && (
                        <Sparkles className="text-yellow-500 mr-1" />
                      )}
                      {font}
                    </li>
                  </TooltipTrigger>
                  <TooltipContent className="p-4">
                    <p>
                      Add this to your HTML:
                    </p>
                    <pre className="bg-gray-100 p-2 rounded">
                      <code className="text-blue-500">
                        &lt;link rel="stylesheet" href="https://fonts.googleapis.com/css?family={font}"&gt;
                      </code>
                    </pre>
                    <p className="mt-2">
                      Style an element with the requested web font, either in a stylesheet:
                    </p>
                    <pre className="bg-gray-100 p-2 rounded">
                      <code className="text-blue-500">
                        .css-selector {'{'}<br />
                        &nbsp;&nbsp;font-family: '{font}', serif;<br />
                        {'}'}
                      </code>
                    </pre>
                    <p className="mt-2">or with an inline style on the element itself:</p>
                    <pre className="bg-gray-100 p-2 rounded">
                      <code className="text-blue-500">
                        &lt;div style="font-family: '{font}', serif;"&gt;Your text&lt;/div&gt;
                      </code>
                    </pre>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </ul>
        </ScrollArea>
        <h3 className="text-lg font-semibold mb-2">Category Weights:</h3>
        {Object.entries(categoryWeights).map(([category, weight]) => (
          <div key={category} className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{category}</span>
              <span>{weight.toFixed(1)}</span>
            </div>
            <Progress value={Math.max(50, (weight / Math.max(...Object.values(categoryWeights))) * 100)} />
          </div>
        ))}
        <Button variant="outline" onClick={clearWeights} className="mt-4 w-full">
          Clear Weights
        </Button>
        {explorationMode && (
          <Badge variant="outline" className="mt-2 w-full">
            Exploration Mode: Discovering new fonts
          </Badge>
        )}
      </Card>
    </div>
  )
}