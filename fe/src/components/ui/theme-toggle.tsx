"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center rounded-full p-2 transition-all duration-300 ease-in-out bg-background border-2 border-transparent hover:border-primary focus:ring-2 focus:ring-primary cursor-pointer"
    >
      <Sun className="absolute h-5 w-5 text-yellow-500 transition-transform duration-300 ease-in-out dark:opacity-0 dark:scale-0" />
      <Moon className="absolute h-5 w-5 text-blue-500 transition-transform duration-300 ease-in-out dark:opacity-100 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
