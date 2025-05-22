
"use client" 

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LayoutDashboard, Users, Calendar, BarChart, Settings, X, Menu } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Pacientes",
      path: "/pacientes",
      icon: Users
    },
    {
      name: "Histórico",
      path: "/historico",
      icon: Calendar
    },
    {
      name: "Relatórios",
      path: "/relatorios",
      icon: BarChart
    },
    {
      name: "Ajustes",
      path: "/configuracoes",
      icon: Settings
    }
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full py-4 px-4 pb-safe">
      <div className="flex items-center justify-between px-4 py-2 bg-background rounded-full shadow-lg w-full max-w-xl relative z-10 border border-border">
        <div className="flex items-center">
          <motion.div
            className="w-8 h-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleNavigation("/dashboard")}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="url(#paint0_linear)" />
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00CEC9" />
                  <stop offset="1" stopColor="#0984E3" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigation(item.path); }}
                className={`text-sm hover:text-primary transition-colors font-medium flex items-center gap-1.5 ${isActive(item.path) ? "text-primary" : "text-muted-foreground"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Mobile Navigation Icons */}
        <div className="md:hidden flex items-center space-x-6">
          {navItems.slice(0, 3).map((item) => (
            <motion.div
              key={item.name}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon 
                className={`w-5 h-5 ${isActive(item.path) ? "text-primary" : "text-muted-foreground"}`} 
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-primary" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-background z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-muted-foreground" />
            </motion.button>
            
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <a 
                    href="#" 
                    className={`text-base font-medium flex items-center gap-2 ${isActive(item.path) ? "text-primary" : "text-muted-foreground"}`}
                    onClick={(e) => { e.preventDefault(); handleNavigation(item.path); }}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
