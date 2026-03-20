"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";
import { supabase } from "@/lib/supabase";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });
const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });

export default function VotacaoPage() {
  const [alunoDados, setAlunoDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  // Estado para o Modal de Informações (Integrantes)
  const [modalInfo, setModalInfo] = useState<{ aberto: boolean, chapa: number | null }>({
    aberto: false,
    chapa: null
  });

  // Estado para o NOVO Modal de Confirmação de Voto
  const [confirmacao, setConfirmacao] = useState<{ aberto: boolean, chapaNome: string }>({
    aberto: false,
    chapaNome: ""
  });

  useEffect(() => {
    const sessao = localStorage.getItem("aluno_sessao");
    if (!sessao) {
      router.push("/");
      return;
    }
    const dados = JSON.parse(sessao);
    if (dados.cargo || !dados.matricula) {
      localStorage.removeItem("aluno_sessao");
      router.push("/");
      return;
    }
    if (dados.is_active === true || dados.is_active === "true") {
      router.push("/");
      return;
    }
    setAlunoDados(dados);
  }, [router]);

  // Função disparada ao clicar nos botões de votar
  function abrirConfirmacao(chapa: string) {
    setConfirmacao({ aberto: true, chapaNome: chapa });
  }

  // Função que realmente grava no banco
  async function finalizarVoto() {
    setCarregando(true);
    const chapaNome = confirmacao.chapaNome;

    try {
      const { error: erroVoto } = await supabase
        .from("votacao")
        .insert([{
          chapa: chapaNome,
          nome: alunoDados.nome,
          matricula: alunoDados.matricula,
          aluno_id: alunoDados.id
        }]);

      if (erroVoto) throw erroVoto;

      const { error: erroUpdate } = await supabase
        .from("alunos")
        .update({ is_active: true })
        .eq("id", alunoDados.id);

      if (erroUpdate) throw erroUpdate;

      localStorage.removeItem("aluno_sessao");
      router.push("/obrigado");
    } catch (error: any) {
      console.error(error);
      alert("Erro ao processar voto.");
      setConfirmacao({ aberto: false, chapaNome: "" });
    } finally {
      setCarregando(false);
    }
  }

  if (!alunoDados) return null;

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black text-white flex flex-col items-center p-6 relative">

      {/* MODAL DE CONFIRMAÇÃO DE VOTO */}
      {confirmacao.aberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl transform animate-in zoom-in-95 duration-300 text-center">
            <div className={`w-16 h-16 rounded-2xl mb-6 mx-auto flex items-center justify-center text-2xl font-black ${confirmacao.chapaNome === 'Chapa 1' ? 'bg-blue-500/20 text-blue-400' : confirmacao.chapaNome === 'Chapa 2' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
              ?
            </div>
            <h3 className={`${bungee.className} text-xl mb-2 text-white uppercase`}>Confirmar Voto?</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Você está prestes a votar na <span className="text-white font-bold">{confirmacao.chapaNome}</span>. <br/> Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col gap-3">
              <button
                disabled={carregando}
                onClick={finalizarVoto}
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
              >
                {carregando ? "PROCESSANDO..." : "SIM, CONFIRMAR VOTO"}
              </button>
              <button
                disabled={carregando}
                onClick={() => setConfirmacao({ aberto: false, chapaNome: "" })}
                className="w-full py-4 bg-transparent text-gray-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IDENTIFICAÇÃO DO ALUNO */}
      <div className="absolute top-6 left-6 animate-in fade-in slide-in-from-left duration-500">
        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Eleitor:</span>
          <span className="text-xs font-bold text-white uppercase">{alunoDados.nome}</span>
        </div>
      </div>

      <header className="text-center mt-24 mb-12">
        <h1 className={`${bungee.className} text-4xl md:text-5xl bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent drop-shadow-sm`}>
          ELEIÇÕES GRÊMIO JOPS
        </h1>
        <p className={`${changaOne.className} text-gray-400 mt-3 uppercase tracking-widest text-sm`}>
          Sua voz, sua escolha, seu futuro.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full px-4">
        {/* CARD CHAPA 1 */}
        <div className="group bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-blue-500/50 transition-all duration-500 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400 text-2xl font-black">01</div>
          <h2 className={`${bungee.className} text-2xl mb-2 text-white`}>Chapa 1</h2>
          <p className="text-gray-400 text-sm mb-8 italic min-h-[40px]">"Novas ideias para a escola."</p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => abrirConfirmacao("Chapa 1")}
              className={`${bungee.className} flex-[2.5] py-4 rounded-2xl text-xs bg-blue-600 hover:bg-blue-500 transition-all transform active:scale-95 shadow-lg shadow-blue-900/20`}
            >
              VOTAR 01
            </button>
            <button 
              onClick={() => setModalInfo({aberto: true, chapa: 1})}
              className={`${bungee.className} flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] flex items-center justify-center transition-all border border-white/5`}
            >
              INFO
            </button>
          </div>
        </div>

        {/* CARD CHAPA 2 */}
        <div className="group bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-red-500/50 transition-all duration-500 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-400 text-2xl font-black">02</div>
          <h2 className={`${bungee.className} text-2xl mb-2 text-white`}>Chapa 2</h2>
          <p className="text-gray-400 text-sm mb-8 italic min-h-[40px]">"União e compromisso estudantil."</p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => abrirConfirmacao("Chapa 2")}
              className={`${bungee.className} flex-[2.5] py-4 rounded-2xl text-xs bg-red-600 hover:bg-red-500 transition-all transform active:scale-95 shadow-lg shadow-red-900/20`}
            >
              VOTAR 02
            </button>
            <button 
              onClick={() => setModalInfo({aberto: true, chapa: 2})}
              className={`${bungee.className} flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] flex items-center justify-center transition-all border border-white/5`}
            >
              INFO
            </button>
          </div>
        </div>

        {/* VOTO NULO */}
        <div className="md:col-span-2 flex justify-center mt-4">
          <div className="group bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all duration-500 shadow-xl flex flex-col items-center text-center max-w-sm w-full">
            <h2 className={`${bungee.className} text-lg mb-1 text-gray-500`}>Voto Nulo</h2>
            <button
              onClick={() => abrirConfirmacao("Nulo")}
              className={`${bungee.className} w-full py-3 rounded-xl text-xs bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all`}
            >
              CONFIRMAR NULO
            </button>
          </div>
        </div>
      </div>

      {/* MODAL INTEGRANTES (Já existente no seu código) */}
      {modalInfo.aberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center px-6 z-50 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] max-w-lg w-full border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setModalInfo({aberto: false, chapa: null})}
              className="absolute top-6 right-6 text-gray-500 hover:text-white text-2xl"
            >✕</button>
            <h2 className={`${bungee.className} text-xl text-blue-400 mb-8 text-center`}>
              {modalInfo.chapa === 1 ? "Integrantes Chapa 1" : "Integrantes Chapa 2"}
            </h2>
            <div className="space-y-3 text-gray-300 text-[11px] overflow-y-auto max-h-[55vh] pr-4 custom-scrollbar uppercase font-bold tracking-tight">
                {modalInfo.chapa === 1 ? (
                  <>
                    <p><span className="text-blue-500/50">Presidente:</span> Julya Alicia Rolim de Araújo</p>
                    <p><span className="text-blue-500/50">Vice-presidente:</span> Sabino Pessoa do Amaral Neto</p>
                    {/* ... (resto dos seus integrantes) */}
                  </>
                ) : (
                  <p className="text-center py-10 text-gray-500 italic">Lista de integrantes não fornecida.</p>
                )}
            </div>
            <button 
              onClick={() => setModalInfo({aberto: false, chapa: null})} 
              className={`${bungee.className} w-full mt-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition text-[10px] uppercase tracking-widest border border-white/5`}
            > FECHAR </button>
          </div>
        </div>
      )}
    </div>
  );
}