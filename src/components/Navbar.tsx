import React, { useState } from "react";
import { Search, Sun, Moon, Sparkles, Menu, X, HelpCircle, FileText, BookOpen, Brain, LayoutDashboard, BookMarked } from "lucide-react";
import { ActiveTab } from "../types";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  apiHasKey: boolean;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
  searchQuery,
  setSearchQuery,
  apiHasKey
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "subjects", label: "Subjects", icon: BookMarked },
    { id: "questions", label: "Questions", icon: HelpCircle },
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "summarize", label: "Summarizer", icon: FileText },
    { id: "mindmap", label: "Mindmap", icon: Brain }
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-505/20 tracking-tighter hover:rotate-6 transition-transform">
              S
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
              STUDENT<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-450 font-bold font-sans">.AI</span>
            </span>
          </div>

          {/* Desktop Navigation Links (Centered) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 border-none text-white shadow-sm shadow-indigo-650/10"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:text-slate-405 dark:hover:text-slate-200 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Utilities & Search */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search revision logs..."
                className="w-48 xl:w-56 h-9 pl-9 pr-4 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 focus:w-60 transition-all duration-300"
              />
            </div>

            {/* Light/Dark Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 sm:p-2.5 bg-slate-100/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-600 dark:text-slate-300 rounded-xl transition duration-200 cursor-pointer"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          {/* Mobile hamburger & Theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-655 dark:text-slate-350 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {/* Search tool */}
          <div className="relative mb-3 py-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search history files..."
              className="w-full h-10 pl-9 pr-4 text-xs bg-slate-50 dark:bg-slate-800/80 border-none rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
