
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { applyDarkMode } from "@/lib/theme-utils";

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    applyDarkMode(newIsDark);
  };

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme} 
      className="w-9 px-0 relative overflow-hidden"
    >
      {isDarkMode ? (
        <div className="animate-fade-in">
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        </div>
      ) : (
        <div className="animate-fade-in">
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        </div>
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
};
