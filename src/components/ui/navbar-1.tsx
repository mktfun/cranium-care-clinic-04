"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Users, Calendar, BarChart, Settings, X, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAvatar } from "@/hooks/useAvatar";

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canDrag, setCanDrag] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { avatarUrl } = useAvatar();

  // Load user data
  useEffect(() => {
    async function carregarUsuario() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('nome, email')
          .eq('id', session.user.id)
          .single();

        if (usuarioData) {
          setUsuario(usuarioData);
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    }
    carregarUsuario();
  }, []);
  
  const toggleMenu = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };
  
  const toggleCompactMode = () => {
    if (!isDragging) {
      setIsCompact(!isCompact);
    }
  };

  const handleAvatarClick = () => {
    if (!isDragging) {
      navigate('/perfil');
    }
  };

  const obterIniciais = (nome: string) => {
    if (!nome) return "U";
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Pacientes", path: "/pacientes", icon: Users },
    { name: "Histórico", path: "/historico", icon: Calendar },
    { name: "Relatórios", path: "/relatorios", icon: BarChart },
    { name: "Ajustes", path: "/configuracoes", icon: Settings }
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle long press to enable dragging
  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setCanDrag(true);
    }, 2000); // 2 seconds long press
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    setTimeout(() => {
      setIsDragging(false);
      setCanDrag(false);
    }, 100); // Small delay to allow click event to fire properly
  };

  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Handle window resize - keep navbar within screen boundaries
  useEffect(() => {
    const handleResize = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
          setPosition(prev => ({ ...prev, x: window.innerWidth - rect.width }));
        }
        if (rect.bottom > window.innerHeight) {
          setPosition(prev => ({ ...prev, y: window.innerHeight - rect.height }));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full py-4 px-4 pb-safe">
      <motion.div 
        ref={navRef}
        className={`flex items-center ${isCompact ? 'justify-center' : 'justify-between'} bg-background rounded-full shadow-lg relative z-10 border border-border mx-[8px] py-[10px] my-[23px] transition-all duration-300`}
        style={{
          width: isCompact ? '70px' : '100%',
          maxWidth: isCompact ? '70px' : 'xl',
          paddingLeft: isCompact ? '10px' : '25px',
          paddingRight: isCompact ? '10px' : '25px',
        }}
        drag={canDrag}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        animate={{
          x: position.x,
          y: position.y,
          scale: isOpen ? 1.05 : 1,
          transition: {
            type: "spring",
            damping: 20,
            stiffness: 300
          }
        }}
      >
        <div className="flex items-center">
          <motion.div 
            className="w-8 h-8 cursor-pointer" 
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: isOpen ? 1.1 : 1,
              rotate: isCompact ? 180 : 0 
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={handleAvatarClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="bg-turquesa text-white text-sm font-medium">
                {obterIniciais(usuario?.nome || "Usuário")}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </div>
        
        {/* Desktop Navigation - Hidden in compact mode */}
        {!isCompact && (
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    handleNavigation(item.path);
                  }}
                  className={`text-sm hover:text-primary transition-colors font-medium flex items-center gap-1.5 ${
                    isActive(item.path) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </a>
              </motion.div>
            ))}
          </nav>
        )}

        {/* Mobile Navigation Icons - Hidden in compact mode */}
        {!isCompact && (
          <div className="md:hidden flex items-center space-x-6">
            {navItems.slice(0, 3).map(item => (
              <motion.div
                key={item.name}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive(item.path) ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile Menu Button - Hidden in compact mode */}
        {!isCompact && (
          <motion.button
            className="md:hidden flex items-center"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-6 w-6 text-primary" />
          </motion.button>
        )}
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-background z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
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
                    className={`text-base font-medium flex items-center gap-2 ${
                      isActive(item.path) ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={e => {
                      e.preventDefault();
                      handleNavigation(item.path);
                    }}
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
  );
};

export { Navbar1 };
