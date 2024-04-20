import { FishIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
          <p className="text-center text-sm leading-loose md:text-left">
            A{" "}
            <a
              href="https://lahacks.com/"
              target="_blank"
              className="font-medium underline underline-offset-4"
            >
              LA Hacks
            </a>{" "}
            project.
          </p>
        </div>
      </div>
    </footer>
  );
};
