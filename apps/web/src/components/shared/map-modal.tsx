"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function MapModal({ isOpen, onClose, title = "View on Map" }: MapModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center flex-col gap-2">
          {/* Placeholder for map */}
          <span className="text-4xl">🗺️</span>
          <p className="text-muted-foreground text-sm">Map View (Placeholder)</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
