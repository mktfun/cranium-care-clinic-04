
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";

interface ResponsiveContainerProps {
  className?: string;
  children: React.ReactNode;
  allowHorizontalScroll?: boolean;
  minWidth?: string;
}

export function ResponsiveContainer({ 
  className, 
  children, 
  allowHorizontalScroll = true,
  minWidth = "500px" 
}: ResponsiveContainerProps) {
  return (
    <div 
      className={cn(
        "w-full",
        allowHorizontalScroll ? 
          "overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent" : 
          "overflow-x-hidden",
        className
      )}
    >
      <div style={{ minWidth: allowHorizontalScroll ? minWidth : undefined }}>
        {children}
      </div>
    </div>
  );
}

interface ResponsiveTableProps {
  className?: string;
  children: React.ReactNode;
  minWidth?: string;
  compactOnMobile?: boolean;
  showColumnsBreakpoint?: {
    xs?: string[];
    sm?: string[];
    md?: string[];
    lg?: string[];
    xl?: string[];
    "2xl"?: string[];
  };
}

export function ResponsiveTable({
  className,
  children,
  minWidth = "500px",
  compactOnMobile = true,
  showColumnsBreakpoint,
}: ResponsiveTableProps) {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  
  // Modifique os filhos para aplicar classes condicionais com base nos breakpoints
  const modifiedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    
    // Se for uma tabela e compactOnMobile estiver ativado, adicione a classe
    if (child.type === 'table' && compactOnMobile && isMobile) {
      return React.cloneElement(child, {
        className: cn(child.props.className, "text-xs")
      });
    }
    
    return child;
  });
  
  return (
    <div className={cn(
      "w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent", 
      className
    )}>
      <div className={cn("min-w-[500px]", className)} style={{ minWidth }}>
        {showColumnsBreakpoint ? (
          <ResponsiveColumnsProvider 
            breakpoint={breakpoint} 
            showColumnsBreakpoint={showColumnsBreakpoint}
          >
            {modifiedChildren}
          </ResponsiveColumnsProvider>
        ) : (
          modifiedChildren
        )}
      </div>
    </div>
  );
}

interface ResponsiveColumnsProviderProps {
  children: React.ReactNode;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showColumnsBreakpoint: {
    xs?: string[];
    sm?: string[];
    md?: string[];
    lg?: string[];
    xl?: string[];
    "2xl"?: string[];
  };
}

// Contexto para prover quais colunas mostrar baseado no breakpoint
const ResponsiveColumnsContext = React.createContext<string[]>([]);

export const useResponsiveColumns = () => {
  return React.useContext(ResponsiveColumnsContext);
};

function ResponsiveColumnsProvider({ 
  children, 
  breakpoint, 
  showColumnsBreakpoint 
}: ResponsiveColumnsProviderProps) {
  // Determina quais colunas devem ser mostradas com base no breakpoint atual
  const visibleColumns = React.useMemo(() => {
    switch (breakpoint) {
      case 'xs':
        return showColumnsBreakpoint.xs || [];
      case 'sm':
        return showColumnsBreakpoint.sm || showColumnsBreakpoint.xs || [];
      case 'md':
        return showColumnsBreakpoint.md || showColumnsBreakpoint.sm || showColumnsBreakpoint.xs || [];
      case 'lg':
        return showColumnsBreakpoint.lg || showColumnsBreakpoint.md || showColumnsBreakpoint.sm || showColumnsBreakpoint.xs || [];
      case 'xl':
        return showColumnsBreakpoint.xl || showColumnsBreakpoint.lg || showColumnsBreakpoint.md || showColumnsBreakpoint.sm || showColumnsBreakpoint.xs || [];
      case '2xl':
        return showColumnsBreakpoint["2xl"] || showColumnsBreakpoint.xl || showColumnsBreakpoint.lg || showColumnsBreakpoint.md || showColumnsBreakpoint.sm || showColumnsBreakpoint.xs || [];
      default:
        return [];
    }
  }, [breakpoint, showColumnsBreakpoint]);
  
  return (
    <ResponsiveColumnsContext.Provider value={visibleColumns}>
      {children}
    </ResponsiveColumnsContext.Provider>
  );
}

// Componente de célula responsiva que só mostra em determinados breakpoints
export interface ResponsiveColumnProps {
  name: string;
  children: React.ReactNode;
  className?: string;
  alwaysRender?: boolean;
}

export function ResponsiveColumn({ name, children, className, alwaysRender = false }: ResponsiveColumnProps) {
  const visibleColumns = useResponsiveColumns();
  const shouldShow = visibleColumns.includes(name) || visibleColumns.length === 0 || alwaysRender;
  
  if (!shouldShow) {
    return null;
  }
  
  return <div className={className}>{children}</div>;
}

export function ResponsiveChart({
  className,
  children,
  height = 350,
  mobileHeight,
}: {
  className?: string;
  children: React.ReactNode;
  height?: number;
  mobileHeight?: number;
}) {
  // Use mobile height if provided, otherwise fallback to 70% of standard height
  const actualMobileHeight = mobileHeight || Math.round(height * 0.7);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden md:block" style={{ height }}>
        {children}
      </div>
      <div className="md:hidden" style={{ height: actualMobileHeight }}>
        {children}
      </div>
    </div>
  );
}
