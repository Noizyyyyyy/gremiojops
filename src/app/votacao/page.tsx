"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";
import { supabase } from "@/lib/supabase";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });
const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });

// LISTA DE INTEGRANTES DA CHAPA 1
const integrantesChapa1 = [
  { cargo: "Presidente", nome: "Julya Alicia Rolim de Araújo" },
  { cargo: "Vice-presidente", nome: "Sabino Pessoa do Amaral Neto" },
  { cargo: "Secretária geral", nome: "Anaís Maria Tavares Coêlho" },
  { cargo: "Primeira secretária", nome: "Maria Vitória Severo da Silva" },
  { cargo: "Tesoureiro geral", nome: "Isak Martins de Figueiredo" },
  { cargo: "Primeira tesoureira", nome: "Beatriz Feitosa Cabral Lima" },
  { cargo: "Diretor de políticas sociais", nome: "David Ruan Silva Santos" },
  { cargo: "Diretora de comunicação", nome: "Isabela da Silva Tavares" },
  { cargo: "Diretor de esportes", nome: "Francisco Sérgio Claudino Andrade" },
  { cargo: "Diretora de cultura", nome: "Marielly Aparecida Lopes Cabral" },
  { cargo: "Diretor de políticas educacionais", nome: "Laila Candido Pereira" },
  { cargo: "Diretora de meio ambiente", nome: "Ana Clara Pereira Alves" },
  { cargo: "Diretora de saúde", nome: "Bruna Silva Santos" },
  { cargo: "Diretora de diversidade e gênero", nome: "Maria Alzenir Alves Macedo" },
  { cargo: "Diretora de mulher", nome: "Maria Edwiges Leonardo Batista" },
  { cargo: "Diretor de relações étnico-raciais", nome: "Dayllan Camilo Cardoso" },
  { cargo: "Suplência", nome: "Jackson Guilherme Sales Mattos" },
];

export default function VotacaoPage() {
  const [alunoDados, setAlunoDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const [modalInfo, setModalInfo] = useState<{ aberto: boolean, chapa: number | null }>({
    aberto: false,
    chapa: null
  });

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
    if (dados.is_active === true || dados.is_active === "true") {
      router.push("/");
      return;
    }
    setAlunoDados(dados);
  }, [router]);

  function abrirConfirmacao(chapa: string) {
    setConfirmacao({ aberto: true, chapaNome: chapa });
  }

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
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center">
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
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Eleitor:</span>
          <span className="text-xs font-bold text-white uppercase">{alunoDados.nome}</span>
        </div>
      </div>

      <header className="text-center mt-24 mb-12">
        <h1 className={`${bungee.className} text-4xl md:text-5xl bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent`}>
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
          <h2 className={`${bungee.className} text-2xl mb-2 text-white`}>Conexão Jovem</h2>
          <p className="text-gray-400 text-sm mb-8 italic min-h-[40px]">"Unindo ideias, fortalecendo vozes."</p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => abrirConfirmacao("Chapa 1")}
              className={`${bungee.className} flex-[2.5] py-4 rounded-2xl text-xs bg-blue-600 hover:bg-blue-500 transition-all transform active:scale-95`}
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
              className={`${bungee.className} flex-[2.5] py-4 rounded-2xl text-xs bg-red-600 hover:bg-red-500 transition-all transform active:scale-95`}
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

      {/* MODAL INTEGRANTES - OTIMIZADO */}
{modalInfo.aberto && (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center px-4 z-[110] animate-in fade-in duration-300">
    <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-[3rem] max-w-md w-full shadow-2xl relative">
      <button 
        onClick={() => setModalInfo({aberto: false, chapa: null})}
        className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
      >✕</button>
      
      <div className="text-center mb-6">
        <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em]">Integrantes da</span>
        <h2 className={`${bungee.className} text-2xl text-white`}>
          {modalInfo.chapa === 1 ? "CHAPA 01" : "CHAPA 02"}
        </h2>
      </div>

      {/* LISTA COM FONTE MENOR (TEXT-[9px]) */}
      <div className="grid grid-cols-1 gap-1.5 border-y border-white/5 py-4">
          {modalInfo.chapa === 1 ? (
            integrantesChapa1.map((membro, i) => (
              <div key={i} className="flex justify-between items-center gap-4 border-b border-white/[0.03] pb-1">
                <span className="text-[9px] text-blue-500/50 font-black uppercase whitespace-nowrap">
                  {membro.cargo}
                </span>
                <span className="text-[10px] text-gray-300 font-medium uppercase text-right leading-tight">
                  {membro.nome}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-gray-600 text-[10px] uppercase font-bold italic tracking-widest">
              Aguardando dados da Chapa 02...
            </p>
          )}
      </div>

      <button 
        onClick={() => setModalInfo({aberto: false, chapa: null})} 
        className={`${bungee.className} w-full mt-6 py-4 rounded-2xl bg-white text-black hover:bg-blue-500 hover:text-white transition-all text-[10px] uppercase tracking-widest`}
      > 
        VOLTAR PARA VOTAÇÃO
      </button>
    </div>
  </div>
)}
    </div>
  );
}