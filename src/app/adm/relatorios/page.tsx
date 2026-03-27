"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Bungee } from "next/font/google";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });

interface Resultado {
  nome: string;
  votos: number;
}

export default function RelatoriosPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [totalEleitores, setTotalEleitores] = useState(0);
  const [totalJaVotaram, setTotalJaVotaram] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    setLoading(true);

    // 1. Busca todos os votos individuais
    const { data: votosData } = await supabase.from("votacao").select("chapa");
    
    // 2. Busca informações dos alunos para o resumo
    const { data: alunosData } = await supabase.from("alunos").select("is_active");

    // Lógica de contagem atualizada para 3 chapas
    let c1 = 0, c2 = 0, c3 = 0, nulo = 0;

    votosData?.forEach((v) => {
      const chapaVotada = v.chapa?.toLowerCase().trim();
      if (["chapa 1", "chapa 01", "1"].includes(chapaVotada)) c1++;
      else if (["chapa 2", "chapa 02", "2"].includes(chapaVotada)) c2++;
      else if (["chapa 3", "chapa 03", "3"].includes(chapaVotada)) c3++; // ADICIONADO CHAPA 3
      else nulo++;
    });

    // Organiza para a tabela (Ordenado por mais votos)
    const listaFinal = [
      { nome: "Chapa 1", votos: c1 },
      { nome: "Chapa 2", votos: c2 },
      { nome: "Chapa 3", votos: c3 }, // ADICIONADO NA LISTA
      { nome: "Nulo/Branco", votos: nulo },
    ].sort((a, b) => b.votos - a.votos);

    setResultados(listaFinal);
    
    if (alunosData) {
      setTotalEleitores(alunosData.length);
      setTotalJaVotaram(alunosData.filter(a => a.is_active).length);
    }

    setLoading(false);
  }

  const totalVotosGeral = resultados.reduce((acc, curr) => acc + curr.votos, 0);

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: auto; margin: 10mm; }
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          header, footer { display: none !important; }
        }
      `}} />

      <div className="print:hidden">
        <Sidebar />
      </div>
      
      <main className="flex-1 md:ml-64 p-6 md:p-10 print:ml-0 print:p-0 print:text-black">
        
        <header className="mb-8 border-b-2 border-indigo-500 pb-6 print:border-black print:text-center">
          <h1 className={`${bungee.className} text-3xl md:text-4xl text-white print:text-black print:text-3xl`}>
            RELATÓRIO OFICIAL DE APURAÇÃO
          </h1>
          <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 print:text-gray-700">
            Eleições Grêmio Estudantil Jops • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </header>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-3 gap-5 mb-10 print:gap-4">
          <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-[1.5rem] print:bg-white print:border-gray-300 print:text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1 print:text-black">Votos Totais</p>
            <h3 className={`${bungee.className} text-3xl text-indigo-400 print:text-black`}>{totalJaVotaram}</h3>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-[1.5rem] print:bg-white print:border-gray-300 print:text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1 print:text-black">Participação</p>
            <h3 className={`${bungee.className} text-3xl text-emerald-400 print:text-black`}>
              {totalEleitores > 0 ? ((totalJaVotaram / totalEleitores) * 100).toFixed(1) : 0}%
            </h3>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-[1.5rem] print:bg-white print:border-gray-300 print:text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1 print:text-black">Eleitores Aptos</p>
            <h3 className={`${bungee.className} text-3xl text-gray-400 print:text-black`}>{totalEleitores}</h3>
          </div>
        </div>

        {/* TABELA DE RESULTADOS */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] overflow-hidden shadow-2xl print:border-black print:rounded-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-[10px] uppercase tracking-widest text-gray-400 print:bg-gray-100 print:text-black">
                <th className="p-6 border-b border-[#334155] print:border-black">Rank</th>
                <th className="p-6 border-b border-[#334155] print:border-black">Candidato / Chapa</th>
                <th className="p-6 border-b border-[#334155] print:border-black text-center">Votos</th>
                <th className="p-6 border-b border-[#334155] print:border-black text-right">Percentual</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {resultados.map((item, index) => {
                const perc = totalVotosGeral > 0 ? (item.votos / totalVotosGeral) * 100 : 0;
                return (
                  <tr key={index} className="border-t border-white/5 print:border-gray-300">
                    <td className="p-6 font-black text-indigo-400 print:text-black">#{index + 1}</td>
                    <td className="p-6 uppercase font-bold text-white print:text-black">{item.nome}</td>
                    <td className="p-6 text-center font-mono text-gray-300 print:text-black">{item.votos}</td>
                    <td className="p-6 text-right font-black text-emerald-400 print:text-black">
                      {perc.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ÁREA DE ASSINATURA - FIXADA NO FINAL DA PÁGINA */}
<div className="hidden print:block print:fixed print:bottom-10 print:left-0 print:right-0">
  <div className="flex flex-col items-center">
    <div className="w-72 border-b-2 border-black mb-3"></div>
    <p className="text-[12px] font-black uppercase tracking-widest">
      Comissão Eleitoral JOPS
    </p>
    <p className="mt-4 text-[8px] text-gray-400 text-center italic uppercase">
      Relatório gerado automaticamente pelo Sistema JOPS em {new Date().toLocaleString('pt-BR')}
    </p>
  </div>
</div>

        {/* BOTÕES DE AÇÃO */}
        <div className="mt-8 flex gap-4 no-print">
          <button 
            onClick={() => window.print()} 
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span></span> Gerar PDF / Imprimir
          </button>
          <button 
            onClick={fetchDados} 
            className="px-8 py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <span></span> Atualizar Dados
          </button>
        </div>
      </main>
    </div>
  );
}