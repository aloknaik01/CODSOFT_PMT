import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
};

/**
 * A premium Modal component using Radix UI and Framer Motion.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-md"
                />
              </DialogPrimitive.Overlay>

              {/* Content Container (to center the modal) */}
              <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                <DialogPrimitive.Content
                  asChild
                  forceMount
                  onEscapeKeyDown={onClose}
                  onPointerDownOutside={onClose}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.34, 1.1, 0.64, 1],
                    }}
                    className={cn(
                      "w-full pointer-events-auto",
                      "glass-card-elevated border border-white/20 dark:border-white/10 shadow-premium",
                      "relative overflow-hidden flex flex-col max-h-[90vh]",
                      sizeMap[size] || sizeMap.md,
                      className,
                    )}
                  >
                    {/* Header */}
                    {(title || description) && (
                      <div className="p-6 pb-5 border-b border-border/40 shrink-0">
                        {title && (
                          <DialogPrimitive.Title className="font-display font-semibold text-xl text-foreground leading-tight">
                            {title}
                          </DialogPrimitive.Title>
                        )}
                        {description && (
                          <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                            {description}
                          </DialogPrimitive.Description>
                        )}
                      </div>
                    )}

                    {/* Body */}
                    <div className="p-6 relative overflow-y-auto scrollbar-thin flex-1 min-h-[100px]">
                      {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                      <div className="p-4 bg-muted/20 flex items-center justify-end gap-3 border-t border-border/60 shrink-0">
                        {footer}
                      </div>
                    )}

                    {/* Close button */}
                    <DialogPrimitive.Close
                      onClick={onClose}
                      className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 group z-10"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4 transition-smooth group-hover:rotate-90 group-hover:scale-110" />
                    </DialogPrimitive.Close>
                  </motion.div>
                </DialogPrimitive.Content>
              </div>
            </div>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
