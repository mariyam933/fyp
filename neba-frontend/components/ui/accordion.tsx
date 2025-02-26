import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon, LockClosedIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root
interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  isLocked?: boolean; // Add the isLocked prop
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, isLocked, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(`border-b !border-gray-300 last:border-none last:rounded-b-2xl first:rounded-t-2xl ${isLocked && "bg-[#F8F8F8]"}`, className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  isLocked?: boolean; // Add the isLocked prop
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, isLocked, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex ">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        `flex flex-1 items-center justify-between  ${isLocked && "cursor-default"} text-sm font-medium transition-all [&[data-state=open]>svg]:rotate-180`,
        className
      )}
      {...props}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault(); // Prevent the accordion from opening if it's locked
        }
      }}
    >
      {children}
      {isLocked ? (
        <LockClosedIcon className="h-6 w-6 shrink-0 border-gray-300 transition-transform duration-200 mr-4" />
      ) : (
        <ChevronDownIcon className="h-6 w-6 shrink-0 border-gray-300 transition-transform duration-200 mr-4" />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("px-4 pb-4", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
