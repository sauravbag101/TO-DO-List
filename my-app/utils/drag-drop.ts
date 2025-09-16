import type { TaskStatus } from "@/types/task"

/**
 * Drag and drop utility service
 * Handles drag and drop operations with proper event management and mobile support
 */
export class DragDropService {
  /**
   * Add drag over effect to element
   */
  static addDragOverEffect(element: HTMLElement): void {
    element.classList.add("drag-over")
  }

  /**
   * Remove drag over effect from element
   */
  static removeDragOverEffect(element: HTMLElement): void {
    element.classList.remove("drag-over")
  }

  /**
   * Add dragging effect to element
   */
  static addDraggingEffect(element: HTMLElement): void {
    element.classList.add("dragging")
  }

  /**
   * Remove dragging effect from element
   */
  static removeDraggingEffect(element: HTMLElement): void {
    element.classList.remove("dragging")
  }

  /**
   * Get status from drop target
   */
  static getDropTargetStatus(element: HTMLElement): TaskStatus | null {
    const statusAttr = element.getAttribute("data-status")
    if (statusAttr === "todo" || statusAttr === "in-progress" || statusAttr === "done") {
      return statusAttr
    }
    return null
  }

  /**
   * Prevent default drag behavior
   */
  static preventDefaultDrag(event: DragEvent): void {
    event.preventDefault()
  }

  /**
   * Create a custom drag image for better visual feedback
   */
  static createDragImage(element: HTMLElement, title: string): HTMLElement {
    const dragImage = element.cloneNode(true) as HTMLElement
    dragImage.style.transform = "rotate(5deg)"
    dragImage.style.opacity = "0.8"
    dragImage.style.pointerEvents = "none"
    dragImage.style.position = "absolute"
    dragImage.style.top = "-1000px"
    dragImage.style.left = "-1000px"
    dragImage.style.zIndex = "1000"

    document.body.appendChild(dragImage)

    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 100)

    return dragImage
  }

  /**
   * Check if device supports touch (mobile/tablet)
   */
  static isTouchDevice(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  }

  /**
   * Get element center coordinates
   */
  static getElementCenter(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  /**
   * Find drop target at coordinates
   */
  static findDropTargetAtPoint(x: number, y: number): HTMLElement | null {
    const elements = document.elementsFromPoint(x, y)
    return (elements.find((el) => el.hasAttribute("data-status")) as HTMLElement) || null
  }

  /**
   * Animate element movement
   */
  static animateElementMove(element: HTMLElement, fromRect: DOMRect, toRect: DOMRect): Promise<void> {
    return new Promise((resolve) => {
      const deltaX = fromRect.left - toRect.left
      const deltaY = fromRect.top - toRect.top

      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      element.style.transition = "transform 0.3s ease-out"

      requestAnimationFrame(() => {
        element.style.transform = "translate(0, 0)"

        setTimeout(() => {
          element.style.transition = ""
          resolve()
        }, 300)
      })
    })
  }
}
