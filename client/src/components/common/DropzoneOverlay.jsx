import { Upload } from "lucide-react";

const DropzoneOverlay = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center text-primary p-6">
        <Upload className="w-16 h-16 mb-4 animate-bounce" />
        <p className="text-2xl font-bold">Drop file anywhere</p>
        <p className="text-lg text-muted-foreground mt-2">
          Release to import your foods
        </p>
      </div>
    </div>
  );
};

export default DropzoneOverlay;
