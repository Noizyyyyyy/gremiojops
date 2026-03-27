"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const rotaAtual = usePathname();

  const fecharMenu = () => setMenuAberto(false);

  return (
    <>
      {/* Botão de Controle do Menu */}
      <div className="fixed top-6 left-6 z-[999] print:hidden">
        <input 
          id="menu-toggle" 
          type="checkbox" 
          checked={menuAberto} 
          onChange={() => setMenuAberto(!menuAberto)} 
          className="hidden"
        />
        <label 
          className="flex flex-col gap-[6px] w-[32px] h-[32px] cursor-pointer items-center justify-center transition-all duration-300" 
          htmlFor="menu-toggle"
        >
          <div className={`h-[3px] w-full bg-indigo-400 rounded-full transition-all duration-300 ${
            menuAberto ? 'rotate-45 translate-y-[9px]' : ''
          }`}></div>
          
          <div className={`h-[3px] w-full bg-indigo-400 rounded-full transition-all duration-300 ${
            menuAberto ? 'opacity-0' : 'opacity-100'
          }`}></div>
          
          <div className={`h-[3px] w-full bg-indigo-400 rounded-full transition-all duration-300 ${
            menuAberto ? '-rotate-45 -translate-y-[9px]' : ''
          }`}></div>
        </label>
      </div>

      {/* Fundo escurecido ao abrir */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[997] transition-opacity duration-300 ${
          menuAberto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={fecharMenu}
      />

      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-[#0f172a] border-r border-indigo-500/20 z-[998] 
        transition-transform duration-300 ease-in-out p-8 pt-24 shadow-2xl
        ${menuAberto ? "translate-x-0" : "-translate-x-full"}
      `}>
        <nav className="flex flex-col h-full gap-8">
          <div>
            <h2 className="text-indigo-400 font-black text-[10px] tracking-[0.3em] uppercase mb-6 opacity-50">
              Painel de Controle
            </h2>
            
            <div className="flex flex-col gap-3">
              <LinkMenu href="/adm" ativo={rotaAtual === "/adm"} onClick={fecharMenu}>
                Estatísticas
              </LinkMenu>
              <LinkMenu href="/adm/relatorios" ativo={rotaAtual === "/adm/relatorios"} onClick={fecharMenu}>
                Relatórios
              </LinkMenu>
              <LinkMenu href="/adm/eleitores" ativo={rotaAtual === "/adm/eleitores"} onClick={fecharMenu}>
              Lista de Eleitores
              </LinkMenu>
            </div>
          </div>
          
          <div className="mt-auto border-t border-white/5 pt-6">
            <button 
              onClick={() => { localStorage.clear(); window.location.href = "/"; }}
              className="group flex items-center gap-3 text-rose-500 hover:text-rose-400 transition-colors"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Encerrar Sessão</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

function LinkMenu({ href, children, ativo, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
        ativo 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}