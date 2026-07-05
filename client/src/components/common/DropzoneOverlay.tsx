import { Upload } from "lucide-react";

interface DropzoneOverlayProps {
  isDragging: boolean;
}

const DropzoneOverlay = ({ isDragging }: DropzoneOverlayProps) => {
  if (!isDragging) return null;

  return (
    <div className="bg-background/90 pointer-events-none fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div className="text-primary flex flex-col items-center p-6">
        <Upload className="mb-4 h-16 w-16 animate-bounce" />
        <p className="text-2xl font-bold">Drop file anywhere</p>
        <p className="text-muted-foreground mt-2 text-lg">
          Release to import your foods
        </p>
      </div>
    </div>
  );
};

export default DropzoneOverlay;
