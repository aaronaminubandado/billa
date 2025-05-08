"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Define proper props interface that includes all needed properties
interface ResponsiveDialogProps
  extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  ...props
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent {...props}>
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent {...props}>
        {title && (
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <div className="px-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

// Export additional components for convenience
export const ResponsiveDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return <DialogContent className={className} {...props} ref={ref} />;
  }

  return <div className={className} {...props} ref={ref} />;
});
ResponsiveDialogContent.displayName = "ResponsiveDialogContent";
