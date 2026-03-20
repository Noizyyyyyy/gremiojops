"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });
const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });

export default function ObrigadoPage() {
  const router = useRouter();

  // Opcional: Redirecionar para o login automaticamente após 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-slate-900 to-black text-white flex flex-col items-center justify-center p-6 text-center">
      
      {/* Container Principal */}
      <div className="bg-white/5 backdrop-blur-2xl p-10 md:p-16 rounded-[3rem] border border-white/10 shadow-2xl max-w-2xl w-full space-y-8 animate-in fade-in zoom-in duration-700">
        
        {/* Ícone de Sucesso Animado */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <svg 
              className="w-12 h-12 text-green-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className={`${bungee.className} text-4xl md:text-5xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent`}>
            Voto Registrado!
          </h1>
          <p className={`${changaOne.className} text-gray-300 text-lg md:text-xl leading-relaxed`}>
            Obrigado por participar das eleições do <br />
            <span className="text-white">Grêmio Estudantil 2026.</span>
          </p>
        </div>

        {/* Mensagem de Segurança */}
        <div className="bg-black/40 py-3 px-6 rounded-2xl border border-white/5 inline-block text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Sua sessão foi encerrada por segurança
        </div>

        <div className="pt-6">
          <button
            onClick={() => router.push("/")}
            className="w-full md:w-auto px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-black hover:bg-green-500 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
          >
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* Footer Discreto */}
      <footer className="mt-12 space-y-2 opacity-40">
        <p className="text-[10px] uppercase tracking-widest">Sistema de Votação Digital</p>
        <p className="text-[9px]">A democracia é construída por todos nós.</p>
      </footer>
    </div>
  );
}