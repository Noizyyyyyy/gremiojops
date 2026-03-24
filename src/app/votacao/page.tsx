"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bungee } from "next/font/google";
import { supabase } from "@/lib/supabase";

const fonteTitulo = Bungee({ weight: "400", subsets: ["latin"] });

export default function PaginaVotacao() {
  const [dadosEleitor, setDadosEleitor] = useState<any>(null);
  const [processandoVoto, setProcessandoVoto] = useState(false);
  const router = useRouter();

  const [modalConfirmacao, setModalConfirmacao] = useState({
    exibir: false,
    nomeDaChapa: ""
  });

  useEffect(() => {
    document.body.style.overflow = modalConfirmacao.exibir ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [modalConfirmacao.exibir]);

  useEffect(() => {
    const sessaoSalva = localStorage.getItem("aluno_sessao");
    
    if (!sessaoSalva) {
      router.push("/");
      return;
    }

    const dados = JSON.parse(sessaoSalva);
    
    if (dados.is_active) {
      router.push("/");
      return;
    }
    
    setDadosEleitor(dados);
  }, [router]);

  const prepararVoto = (nomeChapa: string) => {
    setModalConfirmacao({ exibir: true, nomeDaChapa: nomeChapa });
  };

  async function registrarVotoFinal() {
    setProcessandoVoto(true);
    
    try {
      const { error: erroVoto } = await supabase
        .from("votacao")
        .insert([{
          chapa: modalConfirmacao.nomeDaChapa,
          nome: dadosEleitor.nome,
          matricula: dadosEleitor.matricula,
          aluno_id: dadosEleitor.id
        }]);

      if (erroVoto) throw erroVoto;

      const { error: erroStatus } = await supabase
        .from("alunos")
        .update({ is_active: true })
        .eq("id", dadosEleitor.id);

      if (erroStatus) throw erroStatus;

      localStorage.removeItem("aluno_sessao");
      router.push("/obrigado");

    } catch (falha: any) {
      console.error("Falha na comunicação com o banco:", falha);
      alert("Houve um problema técnico ao enviar seu voto. Por favor, tente novamente.");
      setModalConfirmacao({ exibir: false, nomeDaChapa: "" });
    } finally {
      setProcessandoVoto(false);
    }
  }

  if (!dadosEleitor) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center p-6 relative overflow-x-hidden">

      {modalConfirmacao.exibir && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl">
            <h3 className={`${fonteTitulo.className} text-xl mb-4`}>Confirmar Escolha?</h3>
            <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">
              Você selecionou a <br/>
              <span className="text-indigo-400 font-black underline">{modalConfirmacao.nomeDaChapa}</span>
            </p>
            
            <div className="flex flex-col gap-4">
              <button
                disabled={processandoVoto}
                onClick={registrarVotoFinal}
                className={`${fonteTitulo.className} w-full py-5 bg-indigo-600 rounded-2xl text-xs tracking-widest hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50`}
              >
                {processandoVoto ? "Sincronizando..." : "SIM, CONFIRMAR"}
              </button>
              
              <button
                disabled={processandoVoto}
                onClick={() => setModalConfirmacao({ exibir: false, nomeDaChapa: "" })}
                className="text-slate-500 text-[10px] font-black uppercase hover:text-white transition-all"
              >
                CANCELAR E VOLTAR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-8 left-8">
        <div className="bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest">Sessão Ativa</span>
            <span className="text-xs font-bold text-white uppercase">{dadosEleitor.nome}</span>
          </div>
        </div>
      </div>

      <header className="text-center mt-32 mb-20">
        <h1 className={`${fonteTitulo.className} text-4xl md:text-6xl text-white tracking-tighter`}>
          GRÊMIO JOPS
        </h1>
        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
          Eleições {new Date().getFullYear()}
        </p>
      </header>

      {/* GRID AJUSTADO */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full px-4 mb-20">
        
        <CartaoChapa 
          numero="Chapa 1" 
          nome="Conexão Jovem" 
          slogan="Unindo ideias, fortalecendo vozes." 
          cor="border-indigo-500/40"
          onVotar={() => prepararVoto("Chapa 1")} 
        />

        <CartaoChapa 
          numero="Chapa 2" 
          nome="Aliança Escolar" 
          cor="border-violet-500/40"
          onVotar={() => prepararVoto("Chapa 2")} 
        />

        <CartaoChapa 
          numero="Chapa 3" 
          nome="Atitude Jovem com Proposta" 
          cor="border-emerald-500/40"
          onVotar={() => prepararVoto("Chapa 3")} 
        />

        {/* VOTO NULO EMBAIXO */}
        <div className="bg-rose-500/5 p-10 rounded-[3rem] border border-rose-500/10 hover:border-rose-500/40 transition-all flex flex-col items-center text-center md:col-span-3">
          <h2 className={`${fonteTitulo.className} text-2xl mb-3 text-rose-500`}>Voto Nulo</h2>
          <p className="text-slate-500 text-[11px] mb-10 italic font-bold tracking-widest">
            "Não desejo votar em nenhuma das opções acima."
          </p>
          <button
            onClick={() => prepararVoto("Nulo")}
            className={`${fonteTitulo.className} w-full py-5 rounded-2xl text-[10px] bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all`}
          >
            CONFIRMAR NULO
          </button>
        </div>

      </div>
    </div>
  );
}

function CartaoChapa({ numero, nome, slogan, cor, onVotar }: any) {
  return (
    <div className={`bg-[#0f172a]/40 p-10 rounded-[3rem] border border-white/5 hover:${cor} transition-all duration-500 flex flex-col items-center text-center`}>
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-white text-2xl font-black">
        {numero}
      </div>
      <h2 className={`${fonteTitulo.className} text-2xl mb-3 text-white`}>{nome}</h2>
      <p className="text-slate-400 text-[11px] mb-10 italic font-bold tracking-widest min-h-[40px]">
        "{slogan}"
      </p>
      <button 
        onClick={onVotar} 
        className={`${fonteTitulo.className} w-full py-5 rounded-2xl text-[10px] bg-indigo-600 hover:bg-indigo-500 transition-all`}
      >
        VOTAR {numero}
      </button>
    </div>
  );
}