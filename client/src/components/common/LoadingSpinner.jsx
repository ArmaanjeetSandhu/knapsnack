import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const LoadingSpinner = ({ message = "Loading...", className }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] gap-4",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
