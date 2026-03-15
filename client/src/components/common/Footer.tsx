import { HelpCircle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 py-4 text-white dark:border-t dark:border-white/10 dark:bg-[#011d16]">
      <div className="px-4">
        <div className="flex w-full items-center justify-between no-select">
          <a
            href="https://www.buymeacoffee.com/armaanjeetsandhu"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support this project on Buy Me a Coffee"
          >
            <img
              src="https://img.buymeacoffee.com/button-api/?text=Support%20this%20project&emoji=%E2%98%95&slug=armaanjeetsandhu&button_colour=111827&font_colour=ffffff&font_family=Bree&outline_colour=ffffff&coffee_colour=FFDD00"
              alt="Support this project"
              width="210"
              height="42"
              className="block h-[42px] w-auto rounded-md shadow-sm dark:hidden"
            />
            <img
              src="https://img.buymeacoffee.com/button-api/?text=Support%20this%20project&emoji=%E2%98%95&slug=armaanjeetsandhu&button_colour=141210&font_colour=ffffff&font_family=Bree&outline_colour=ffffff&coffee_colour=FFDD00"
              alt="Support this project"
              width="210"
              height="42"
              className="hidden h-[42px] w-auto rounded-md shadow-sm dark:block"
            />
          </a>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/faq" aria-label="Frequently Asked Questions">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-1 text-white hover:bg-transparent hover:text-gray-300 sm:px-4"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="hidden sm:inline">FAQ</span>
              </Button>
            </Link>

            <Link to="/feedback" aria-label="Provide Feedback">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-1 text-white hover:bg-transparent hover:text-gray-300 sm:px-4"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="hidden sm:inline">Feedback</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
