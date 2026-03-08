import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { GithubLogoIcon } from "@phosphor-icons/react";

const FeedbackPage = () => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("");
        setEmail("");
      } else setStatus("error");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="flex justify-center px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-8 md:flex-row md:gap-16 lg:gap-24">
        <div className="flex w-full flex-col justify-between pb-6 pt-2 text-center md:w-5/12 md:pb-8 lg:pb-10">
          <div className="flex flex-col items-center">
            <div className="mb-6 flex justify-center">
              <img
                src="/feedback.gif"
                alt="Feedback"
                className="h-auto w-32 rounded-lg object-contain md:w-40"
              />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100 md:text-5xl">
              We'd love your feedback!
            </h1>
            <p className="mx-auto mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
              Found a bug, have a feature request, or just want to share your
              thoughts? Let us know!
            </p>
          </div>

          <div className="mt-auto w-full max-w-sm self-center">
            <a
              href="https://github.com/ArmaanjeetSandhu/knapsnack/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                className="flex h-12 w-full items-center justify-center gap-2 text-base"
                variant="outline"
              >
                <GithubLogoIcon className="h-5 w-5" />
                Create an Issue on GitHub
              </Button>
            </a>
          </div>
        </div>

        <div className="flex w-full flex-col md:w-6/12">
          <div className="flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/50 md:p-8 lg:p-10">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Send a quick message
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex h-full flex-col space-y-5 text-left"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Your Email{" "}
                  <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  className="w-full"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Leave your email so we can get back to you.
                </p>
              </div>

              <div className="flex flex-1 flex-col pb-4">
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  className="flex w-full flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us what you think..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              <div className="mt-auto">
                <Button
                  type="submit"
                  className="flex h-12 w-full items-center gap-2 text-base"
                  disabled={status === "loading" || status === "success"}
                >
                  {status === "loading"
                    ? "Sending..."
                    : status === "success"
                      ? "Sent Successfully!"
                      : "Send Feedback"}
                  {status !== "loading" && status !== "success" && (
                    <Send className="h-4 w-4" />
                  )}
                </Button>

                {status === "error" && (
                  <p className="mt-2 text-center text-sm text-red-500">
                    Failed to send feedback. Please try again later.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
