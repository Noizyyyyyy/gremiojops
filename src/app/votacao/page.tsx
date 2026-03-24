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
    nomeDaChapa: "",
    corDestaque: "indigo-500"
  });

  // Bloqueio de scroll quando o modal está aberto
  useEffect(() => {
    document.body.style.overflow = modalConfirmacao.exibir ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [modalConfirmacao.exibir]);

  // Verificação de Sessão
  useEffect(() => {
    const sessaoSalva = localStorage.getItem("aluno_sessao");

    if (!sessaoSalva) {
      router.push("/");
      return;
    }

    const dados = JSON.parse(sessaoSalva);

    // Se já votou, manda de volta pro início
    if (dados.is_active === true || dados.is_active === "true") {
      router.push("/");
      return;
    }

    setDadosEleitor(dados);
  }, [router]);

  const prepararVoto = (nomeChapa: string, cor: string) => {
    setModalConfirmacao({ exibir: true, nomeDaChapa: nomeChapa, corDestaque: cor });
  };

  async function registrarVotoFinal() {
    setProcessandoVoto(true);

    try {
      // 1. Insere o voto na tabela 'votacao'
      const { error: erroVoto } = await supabase
        .from("votacao")
        .insert([{
          chapa: modalConfirmacao.nomeDaChapa,
          nome: dadosEleitor.nome,
          matricula: dadosEleitor.matricula,
          aluno_id: dadosEleitor.id
        }]);

      if (erroVoto) throw erroVoto;

      // 2. Atualiza o status do aluno para 'is_active: true' (já votou)
      const { error: erroStatus } = await supabase
        .from("alunos")
        .update({ is_active: true })
        .eq("id", dadosEleitor.id);

      if (erroStatus) throw erroStatus;

      // 3. Finaliza a sessão e redireciona
      localStorage.removeItem("aluno_sessao");
      router.push("/obrigado");

    } catch (falha: any) {
      console.error("Erro no processo:", falha);
      alert("Erro ao enviar voto. Tente novamente.");
      setModalConfirmacao({ exibir: false, nomeDaChapa: "", corDestaque: "indigo-500" });
    } finally {
      setProcessandoVoto(false);
    }
  }

  if (!dadosEleitor) return null;

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-black text-white flex flex-col items-center p-6 relative overflow-x-hidden selection:bg-indigo-500/30">

      {/* MODAL DE CONFIRMAÇÃO */}
      {modalConfirmacao.exibir && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl shadow-indigo-500/10">
            <div className={`w-20 h-20 rounded-3xl mb-6 mx-auto flex items-center justify-center text-3xl font-black bg-white/5 border border-white/10 text-${modalConfirmacao.corDestaque}`}>
              ?
            </div>
            
            <h3 className={`${fonteTitulo.className} text-xl mb-2 uppercase tracking-tight`}>
              Confirmar voto?
            </h3>

            <p className="text-slate-400 text-[11px] mb-8 uppercase tracking-widest font-bold leading-relaxed">
              Você selecionou:
              <br />
              <span className={`text-white font-black underline underline-offset-4 decoration-${modalConfirmacao.corDestaque}`}>
                {modalConfirmacao.nomeDaChapa}
              </span>
            </p>

            <div className="flex flex-col gap-4">
              <button
                disabled={processandoVoto}
                onClick={registrarVotoFinal}
                className={`${fonteTitulo.className} w-full py-5 bg-indigo-600 rounded-2xl text-xs tracking-widest hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50`}
              >
                {processandoVoto ? "SINCRONIZANDO..." : "CONFIRMAR VOTO"}
              </button>

              <button
                disabled={processandoVoto}
                onClick={() => setModalConfirmacao({ exibir: false, nomeDaChapa: "", corDestaque: "indigo-500" })}
                className="text-slate-500 text-[10px] font-black uppercase hover:text-white transition-colors"
              >
                VOLTAR PARA CHAPAS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IDENTIFICAÇÃO DO USUÁRIO */}
      <div className="absolute top-8 left-8 animate-in fade-in slide-in-from-top duration-700">
        <div className="bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
            Eleitor: <span className="text-white">{dadosEleitor.nome}</span>
          </span>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
      <header className="text-center mt-8 mb-8">
        <h1 className={`${fonteTitulo.className} text-4xl md:text-6xl bg-gradient-to-b from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent tracking-tighter`}>
          GRÊMIO JOPS
        </h1>
        <div className="h-1 w-24 bg-indigo-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"></div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-6 italic">
          EEEP PROFESSOR JOSÉ OSMAR PLÁCIDO DA SILVA |  {new Date().getFullYear()}
        </p>
      </header>

      {/* GRID DE CHAPAS */}
      <div className="grid md:grid-cols-3 gap-5 max-w-6xl w-full px-2 mb-20 items-stretch">

        <CartaoChapa
          numero="CHAPA 01"
          nome="Conexão Jovem"
          slogan="Unindo ideias, fortalecendo vozes."
          corBase="bg-blue-600 hover:bg-blue-500"
          onVotar={() => prepararVoto("Chapa 1", "indigo-400")}
        />

        <CartaoChapa
          numero="Chapa 02"
          nome="Aliança Escolar"
          slogan="A união que transforma: escutamos, representamos e agimos."
          corBase="bg-blue600 hover:bg-blue-500"
          onVotar={() => prepararVoto("Chapa 2", "violet-400")}
        />

        <CartaoChapa
          numero="CHAPA 03"
          nome="Atitude Jovem"
          slogan="Ideias voam, ações permanecem."
          corBase="bg-blue-600 hover:bg-blue-500"
          onVotar={() => prepararVoto("Chapa 3", "emerald-400")}
        />

        {/* VOTO NULO AMPLIADO NO RODAPÉ */}
        <div className="bg-rose-500/5 backdrop-blur-xl p-10 rounded-[3rem] border border-rose-500/10 hover:border-rose-500/30 transition-all duration-500 flex flex-col items-center text-center md:col-span-3 group">
          <div className="w-12 h-12 rounded-full border border-rose-500/20 flex items-center justify-center text-rose-500 font-black mb-4 group-hover:bg-rose-600 group-hover:text-white transition-all">X</div>
          
          <h2 className={`${fonteTitulo.className} text-2xl text-rose-500/80 group-hover:text-rose-500`}>
            Voto Nulo
          </h2>

          <p className="text-slate-500 text-xs my-4 italic uppercase font-bold tracking-widest leading-relaxed">
            Não desejo votar em nenhuma das representações acima.
          </p>

          <button
            onClick={() => prepararVoto("Nulo", "rose-400")}
            className={`${fonteTitulo.className} w-full max-w-md py-5 rounded-2xl bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all tracking-widest`}
          >
            CONFIRMAR VOTO NULO
          </button>
        </div>

      </div>
    </div>
  );
}

/* COMPONENTE DE CARD REUTILIZÁVEL */
function CartaoChapa({ numero, nome, slogan = "", corBase, onVotar }: any) {
  // Mapeamento de cores para classes do Tailwind (evita bugs de compilação dinâmica)
  const cores: any = {
    "indigo-500": { border: "group-hover:border-indigo-500/50", glow: "bg-indigo-500/10", text: "text-indigo-400", btn: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20" },
    "violet-500": { border: "group-hover:border-violet-500/50", glow: "bg-violet-500/10", text: "text-violet-400", btn: "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20" },
    "emerald-500": { border: "group-hover:border-emerald-500/50", glow: "bg-emerald-500/10", text: "text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" }
  };

  const estilo = cores[corBase] || cores["indigo-500"];

  return (
    <div className={`
      relative group overflow-hidden
      bg-slate-900/40 backdrop-blur-2xl 
      p-8 rounded-[3rem] 
      border border-white/5 ${estilo.border}
      transition-all duration-500 
      flex flex-col h-[450px]
      hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]
    `}>
      
      {/* Efeito de Luz de Fundo (Glow) */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 ${estilo.glow} blur-[60px] rounded-full transition-opacity group-hover:opacity-100 opacity-50`} />

      {/* Número em Destaque */}
      <div className="flex flex-col items-center justify-center text-center h-[120px] relative z-10">
        <div className={`
          ${fonteTitulo.className} text-4xl mb-2 
          ${estilo.text} opacity-40 group-hover:opacity-100 
          transition-all duration-500 group-hover:scale-110
        `}>
          {numero}
        </div>
        <h2 className={`${fonteTitulo.className} text-2xl leading-tight text-white group-hover:text-white/90`}>
          {nome}
        </h2>
      </div>

      {/* Divisor Elegante */}
      <div className={`w-12 h-1 ${estilo.glow.replace('/10', '/30')} mx-auto rounded-full mb-6`} />

      {/* Slogan */}
      <div className="h-[80px] flex items-center justify-center text-center px-4 relative z-10">
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed italic">
          {slogan ? `"${slogan}"` : ""}
        </p>
      </div>

      {/* Botão Customizado */}
      <div className="mt-auto relative z-10">
        <button
          onClick={onVotar}
          className={`
            ${fonteTitulo.className} 
            w-full py-5 rounded-2xl text-[10px] tracking-[0.2em] 
            text-white transition-all 
            shadow-lg active:scale-95
            ${estilo.btn}
          `}
        >
          SELECIONAR
        </button>
      </div>
    </div>
  );
}