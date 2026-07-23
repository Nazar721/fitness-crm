"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Plus, TrendingUp, User, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const mobileNavItems = [
  { href: "/", icon: Home, label: "Головна" },
  { href: "/workouts", icon: Dumbbell, label: "Тренування" },
  { href: "/workouts/new", icon: Plus, label: "Нове", isCenter: true },
  { href: "/records", icon: Trophy, label: "Рекорди" },
  { href: "/progress", icon: TrendingUp, label: "Прогрес" },
];

const desktopNavItems = [
  { href: "/", icon: Home, label: "Головна" },
  { href: "/workouts", icon: Dumbbell, label: "Тренування" },
  { href: "/workouts/new", icon: Plus, label: "Нове", isCenter: true },
  { href: "/records", icon: Trophy, label: "Рекорди" },
  { href: "/progress", icon: TrendingUp, label: "Прогрес" },
  { href: "/profile", icon: User, label: "Профіль" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: Bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative max-w-lg mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-around h-16">
            {mobileNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;

              if (item.isCenter) {
                return (
                  <Link key={item.href} href={item.href} className="relative -mt-8">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-lime to-electric flex items-center justify-center"
                      style={{ boxShadow: "0 4px 20px rgba(57, 255, 20, 0.4), 0 0 40px rgba(57, 255, 20, 0.2)" }}
                    >
                      <Plus className="w-7 h-7 text-black" strokeWidth={3} />
                    </motion.div>
                  </Link>
                );
              }

              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3 touch-target">
                  <motion.div whileTap={{ scale: 0.85 }} className="relative">
                    <Icon className={`w-6 h-6 transition-all duration-200 ${isActive ? "text-lime" : "text-gray-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-lime rounded-full" style={{ boxShadow: "0 0 8px rgba(57, 255, 20, 0.6)" }} />
                    )}
                  </motion.div>
                  <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-lime" : "text-gray-500"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop: Sidebar nav */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 z-50 flex-col items-center">
        <div className="absolute inset-0 bg-[#0a0a0c]/95 backdrop-blur-xl border-r border-white/[0.04]" />
        <div className="relative flex flex-col items-center h-full py-6 gap-2">
          {/* Logo */}
          <div className="mb-6 p-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime to-electric flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
          </div>

          {/* Nav Items */}
          {desktopNavItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Link key={item.href} href={item.href} className="relative my-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime to-electric flex items-center justify-center"
                    style={{ boxShadow: "0 4px 20px rgba(57, 255, 20, 0.3)" }}
                  >
                    <Plus className="w-6 h-6 text-black" strokeWidth={3} />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link key={item.href} href={item.href} className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative flex items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-lime/10" 
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? "text-lime" : "text-gray-500 group-hover:text-gray-300"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-desktop"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-lime rounded-r-full"
                      style={{ boxShadow: "0 0 12px rgba(57, 255, 20, 0.5)" }}
                    />
                  )}
                </motion.div>
                <span className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-gray-800 border border-white/[0.08] ${
                  isActive ? "text-lime" : "text-gray-300"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
