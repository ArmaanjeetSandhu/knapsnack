import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

const LoadingSpinner = ({
  message = "Loading...",
  className,
}: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
