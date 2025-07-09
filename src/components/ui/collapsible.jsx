"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = React.forwardRef((props, ref) => {
  const { className, children, ...rest } = props

  return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref}
      className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
      {...rest}
    >
      <div className={className}>{children}</div>
    </CollapsiblePrimitive.CollapsibleContent>
  )
})

CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
