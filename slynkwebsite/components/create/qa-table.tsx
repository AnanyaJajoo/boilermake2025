"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

interface QAPair {
  id: string
  question: string
  answer: string
}

interface QATableProps {
  pairs: QAPair[]
  onChange: (pairs: QAPair[]) => void
}

export function QATable({ pairs, onChange }: QATableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addPair = () => {
    const newPair = {
      id: `qa-${Date.now()}`,
      question: "",
      answer: "",
    }
    onChange([...pairs, newPair])
    setExpandedId(newPair.id)
  }

  const removePair = (id: string) => {
    onChange(pairs.filter((pair) => pair.id !== id))
  }

  const updatePair = (id: string, field: "question" | "answer", value: string) => {
    onChange(pairs.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)))
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Questions & Answers</h3>
        <Button
          onClick={addPair}
          className="gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
          size="sm"
        >
          <Plus size={16} />
          <span>Add Q&A</span>
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {pairs.map((pair, index) => (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-medium text-pink-600">
                    {index + 1}
                  </div>
                  <h4 className="text-sm font-medium text-gray-700 line-clamp-1">{pair.question || "New Question"}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    onClick={() => toggleExpand(pair.id)}
                  >
                    {expandedId === pair.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-500"
                    onClick={() => removePair(pair.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {expandedId === pair.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  <div className="mb-3">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Question</label>
                    <Input
                      value={pair.question}
                      onChange={(e) => updatePair(pair.id, "question", e.target.value)}
                      placeholder="Enter a question"
                      className="border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Answer</label>
                    <Textarea
                      value={pair.answer}
                      onChange={(e) => updatePair(pair.id, "answer", e.target.value)}
                      placeholder="Enter the answer"
                      rows={3}
                      className="border-gray-200"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {pairs.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
            <p className="text-sm text-gray-500">No questions added yet. Click "Add Q&A" to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
