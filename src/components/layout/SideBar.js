// src/components/SideBar.js
'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/layout/SidebarContext';
import { Menu, X, Home, BarChart3, Package, History, TrendingUp, User, LogOut } from 'lucide-react';
import SidebarAuth from './SidebarAuth';
import { useSession } from 'next-auth/react';

const menuItems = [
  { id: '/', label: 'Home', icon: Home, href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { id: 'estoque', label: 'Estoque', icon: Package, href: '/estoque' },
  { id: 'historico', label: 'Histórico', icon: History, href: '/historico' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { data: session } = useSession();
  
  // ❌ ESCONDE SIDEBAR se NÃO for ADMIN ou FUNCIONÁRIO
  const showSidebar = session?.user?.role === 'ADMIN' || session?.user?.role === 'FUNCIONARIO';
  
  if (!showSidebar) {
    return null;
  }

  const activeId = pathname.split('/')[1] || '/';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
<aside
  data-sidebar
  className={`fixed left-0 top-0 h-full bg-white shadow-2xl border-r border-gray-100 flex flex-col z-40 transition-all duration-500 ease-out ${
    isSidebarOpen ? 'w-64' : 'w-16'
  } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
>
        {/* HEADER - CORES DA LOJA */}
        <div className={`p-6 bg-gradient-to-r from-[#394189] to-[#c33638] text-white flex items-center ${
          isSidebarOpen ? 'justify-between' : 'justify-center'
        }`}>
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👟</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Calçados Araújo
              </h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl hover:bg-white/20 transition-all duration-200 ${
              isSidebarOpen ? 'ml-auto' : 'mx-auto'
            }`}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            
            return (
              <a
                    href={item.href}
                    key={item.id}
                    className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#394189]/10 to-[#c33638]/10 text-[#394189] shadow-md border border-[#394189]/20'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#394189]'
                    } ${isSidebarOpen ? '' : 'justify-center'}`}
                    title={item.label}
                  >
                    {/* ÍCONE */}
                    <Icon 
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isActive ? 'text-[#394189]' : 'group-hover:text-[#394189]'
                      }`} 
                    />
                    
                    {/* LABEL */}
                    {isSidebarOpen && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    
                    {/* ❌ BARRA LATERAL REMOVIDA! */}
                    
                    {/* HOVER EFFECT */}
                    {!isActive && (
                      <div className="absolute left-0 top-0 h-full w-0 bg-gradient-to-r from-[#394189]/5 to-[#c33638]/5 rounded-xl transition-all duration-300 group-hover:w-full"></div>
                    )}
                </a>
            );
          })}
        </nav>
        
        {/* FOOTER - SÓ QUANDO ABERTO */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-100 space-y-4">
            {/* SidebarAuth */}
            <SidebarAuth />
            
            {/* DIVISOR */}
            <div className="border-t border-gray-200"></div>
            
            {/* VERSÃO */}
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">Versão 2.0</p>
              <p className="text-xs text-gray-400">Calçados Araújo</p>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay para mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
        />
      )}

      {/* Botão hambúrguer mobile */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-6 left-6 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
        >
          <Menu className="w-6 h-6 text-[#394189]" />
        </button>
      )}
    </>
  );
}
