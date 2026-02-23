import { Upload } from "lucide-react";

interface DropzoneOverlayProps {
  isDragging: boolean;
}

const DropzoneOverlay = ({ isDragging }: DropzoneOverlayProps) => {
  if (!isDragging) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center p-6 text-primary">
        <Upload className="mb-4 h-16 w-16 animate-bounce" />
        <p className="text-2xl font-bold">Drop file anywhere</p>
        <p className="mt-2 text-lg text-muted-foreground">
          Release to import your foods
        </p>
      </div>
    </div>
  );
};

export default DropzoneOverlay;
