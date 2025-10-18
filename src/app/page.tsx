import TimeCalculator from "@/components/time-calculator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <>
      <ThemeToggle />
      {/* Diwali Greeting Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 dark:from-orange-600 dark:via-red-600 dark:to-yellow-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative text-center py-4 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 diya-flicker">
            🪔 Happy Diwali! 🪔
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            May this festival of lights bring joy, prosperity, and success to your work!
          </p>
          {/* Sparkle effects */}
          <div className="absolute top-2 left-4 text-yellow-300 sparkle-twinkle">✨</div>
          <div className="absolute top-4 right-8 text-yellow-300 sparkle-twinkle delay-100">✨</div>
          <div className="absolute bottom-2 left-8 text-yellow-300 sparkle-twinkle delay-200">✨</div>
          <div className="absolute bottom-4 right-4 text-yellow-300 sparkle-twinkle delay-300">✨</div>
        </div>
      </div>
      <TimeCalculator />
    </>
  );
}
