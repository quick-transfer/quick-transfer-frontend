"use client"

import { useRef, useLayoutEffect, useCallback } from "react"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

/**
 * Calculates the exact left offset and rendered text width of the previous sibling's text content.
 */
function getSiblingContentBounds(prevSibling: HTMLElement, parent: HTMLElement) {
  const parentRect = parent.getBoundingClientRect()

  // 1. Traverse all non-empty text nodes inside the sibling
  const textNodes: Node[] = []
  const walk = document.createTreeWalker(prevSibling, NodeFilter.SHOW_TEXT, null)
  let node: Node | null
  while ((node = walk.nextNode())) {
    if (node.textContent && node.textContent.trim().length > 0) {
      textNodes.push(node)
    }
  }

  if (textNodes.length > 0) {
    const range = document.createRange()
    try {
      range.setStart(textNodes[0], 0)
      const lastNode = textNodes[textNodes.length - 1]
      range.setEnd(lastNode, lastNode.textContent?.length || 0)
      const rect = range.getBoundingClientRect()
      if (rect.width > 0) {
        return {
          left: rect.left - parentRect.left,
          width: rect.width,
        }
      }
    } catch {
      // ignore range measurement errors
    }
  }

  // 2. Fallback for non-text graphic elements (e.g. logo image/SVG)
  const graphics = prevSibling.querySelectorAll("img, svg")
  if (graphics.length > 0) {
    let minLeft = Infinity
    let maxRight = -Infinity
    graphics.forEach((c) => {
      const r = c.getBoundingClientRect()
      if (r.width > 0) {
        if (r.left < minLeft) minLeft = r.left
        if (r.right > maxRight) maxRight = r.right
      }
    })
    if (minLeft !== Infinity && maxRight > minLeft) {
      return {
        left: minLeft - parentRect.left,
        width: maxRight - minLeft,
      }
    }
  }

  return null
}

/**
 * Separator that automatically sizes itself to be 5-10px wider (specifically 8px wider)
 * than the text content of its previous sibling element, aligned directly with the text.
 */
function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  const ref = useRef<HTMLDivElement>(null)

  const updateWidth = useCallback(() => {
    const el = ref.current
    if (!el || orientation !== "horizontal" || el.hasAttribute("data-no-autosize")) return

    const prevSibling = el.previousElementSibling as HTMLElement | null
    if (!prevSibling) return

    const parent = el.parentElement
    if (!parent) return

    const bounds = getSiblingContentBounds(prevSibling, parent)
    if (!bounds || bounds.width === 0) return

    // 8px wider total (extends 4px to the left and 4px to the right of the text)
    const targetWidth = bounds.width + 8
    const targetLeft = Math.max(0, bounds.left - 4)

    el.style.width = `${targetWidth}px`
    el.style.marginLeft = `${targetLeft}px`
  }, [orientation])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || orientation !== "horizontal" || el.hasAttribute("data-no-autosize")) return

    // Initial calculation
    updateWidth()

    // Observe changes to sibling and parent
    const prevSibling = el.previousElementSibling
    const parent = el.parentElement

    const observer = new ResizeObserver(() => {
      updateWidth()
    })

    if (prevSibling) observer.observe(prevSibling)
    if (parent) observer.observe(parent)

    return () => observer.disconnect()
  }, [orientation, updateWidth])

  return (
    <SeparatorPrimitive
      ref={ref}
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border rounded-full data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:h-full data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
