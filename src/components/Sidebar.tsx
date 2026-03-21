"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "📊 MENU", href: "/adm" },
    { name: "👥 ELEITORES", href: "/adm/eleitores" },
    { name: "📄 RELATÓRIOS", href: "/adm/relatorios" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <aside className="w-64 bg-black/40 border-r border-white/5 flex flex-col p-6 fixed h-full z-50">
      <h1 className="text-2xl font-black text-white-400 italic mb-10 tracking-tighter">Admin Painel</h1>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                isActive 
                ? "bg-white/10 border-white/10 text-white" 
                : "text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={handleLogout}
        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-xl text-xs font-black transition-all border border-red-500/20"
      >
        LOGOUT / SAIR
      </button>
    </aside>
  );
}