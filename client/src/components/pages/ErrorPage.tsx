import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const ErrorPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
    <div className="mb-4">
      <img
        src="/goals.gif"
        alt="404 Error"
        className="mx-auto h-auto w-48 rounded-lg object-contain"
      />
    </div>
    <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
      404 - Page Not Found
    </h1>
    <p className="mb-8 max-w-md text-xl text-gray-600 dark:text-gray-400">
      Uh-oh! The page you are looking for doesn&apos;t exist or has been moved.
    </p>
    <Link to="/">
      <Button className="flex items-center gap-2">
        <Home className="h-4 w-4" />
        Back to Home
      </Button>
    </Link>
  </div>
);

export default ErrorPage;
