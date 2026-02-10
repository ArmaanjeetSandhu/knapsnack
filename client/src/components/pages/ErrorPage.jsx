import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const ErrorPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-8">
        <img
          src="/goals.gif"
          alt="404 Error"
          className="w-32 h-auto mx-auto object-contain rounded-lg"
        />
      </div>

      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        404 - Page Not Found
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Uh-oh! The page you are looking for doesn&apos;t exist or has been
        moved.
      </p>

      <Link to="/">
        <Button className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default ErrorPage;
