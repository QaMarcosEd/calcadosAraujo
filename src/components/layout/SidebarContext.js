// src/components/SidebarContext.js
'use client';

import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false); // Para mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Para desktop

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen, isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);