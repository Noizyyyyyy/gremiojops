"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";
import { supabase } from "@/lib/supabase";

const bungee = Bungee({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap" 
});

const changaOne = Changa_One({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap" 
});

export default function Home() {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error" as "error" | "success"
  });

  const router = useRouter();

  const showModal = (title: string, message: string, type: "error" | "success" = "error") => {
    setModal({ isOpen: true, title, message, type });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 4) {
      value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    } else {
      value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    }
    setPassword(value.slice(0, 10));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!matricula || password.length < 10) {
      showModal("Dados Incompletos", "Preencha a matrícula e a data de nascimento completa.");
      setLoading(false);
      return;
    }

    const [dia, mes, ano] = password.split("/");
    const dataFormatadaUSA = `${ano}-${mes}-${dia}`;

    try {
      const { data: aluno } = await supabase
        .from("alunos")
        .select("*")
        .eq("matricula", matricula)
        .maybeSingle();

      if (aluno) {
        // VERIFICAÇÃO DE VOTO JÁ REALIZADO
        if (aluno.is_active === true || aluno.is_active === "true") {
          showModal("Voto já Registrado", "Você já participou desta eleição. O sistema reiniciará em 5 segundos.");
          setLoading(false);
          
          // Reinicia a página após 5 segundos
          setTimeout(() => {
            window.location.reload();
          }, 5000);
          return;
        }

        if (aluno.data_nascimento === dataFormatadaUSA) {
          localStorage.setItem("aluno_sessao", JSON.stringify(aluno));
          router.push("/votacao");
          return;
        } else {
          showModal("Acesso Negado", "Data de nascimento incorreta.");
          setLoading(false);
          return;
        }
      }

      const { data: professor } = await supabase
        .from("professores")
        .select("*")
        .eq("matricula", matricula)
        .maybeSingle();

      if (professor) {
        if (professor.data_nascimento === dataFormatadaUSA) {
          const sessaoAdmin = { ...professor, role: "adm" };
          localStorage.setItem("user_session", JSON.stringify(sessaoAdmin));
          router.push("/adm");
          return;
        } else {
          showModal("Erro de Professor", "Dados do docente incorretos.");
          setLoading(false);
          return;
        }
      }

      showModal("Não Encontrado", "Matrícula não localizada.");
    } catch (err) {
      console.error(err);
      showModal("Erro", "Falha na conexão com o banco.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black text-white flex flex-col items-center justify-center p-6 overflow-x-hidden">
      
      {modal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl ring-1 ring-white/20">
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-2xl font-bold ${modal.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
              {modal.type === 'error' ? '!' : '✓'}
            </div>
            <h3 className={`${bungee.className} text-xl mb-2 text-white`}>{modal.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{modal.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95"
            >
              Reiniciar Agora
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className={`${bungee.className} text-4xl md:text-6xl bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent`}>
          VOTE NO FUTURO
        </h1>
        <p className={`${changaOne.className} text-gray-400 mt-3 tracking-widest uppercase text-xs md:text-sm`}>
          Portal de Eleições • Grêmio Estudantil
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl">
        <div className="space-y-8">
          <div>
            <h2 className={`${bungee.className} text-2xl text-white`}>Acesso</h2>
            <p className="text-gray-400 text-sm">Insira seus dados para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-blue-400 ml-1">Matrícula</label>
              <input
                type="text"
                placeholder="Número da matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-blue-500 outline-none text-white placeholder:text-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-purple-400 ml-1">Data de Nascimento</label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-purple-500 outline-none text-white placeholder:text-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-black hover:bg-blue-500 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar no Sistema"}
            </button>
          </form>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center p-6 border-l border-white/5">
          <div className="relative w-[300px] h-[300px]">
            <Image
              src="/acesso.jpeg"
              alt="Grêmio Estudantil"
              fill
              className="rounded-3xl shadow-2xl object-cover"
              priority
            />
          </div>
          <p className={`${changaOne.className} text-gray-500 mt-8 text-center text-sm leading-relaxed italic`}>
            "A democracia na escola começa <br/> com a sua participação."
          </p>
        </div>
      </div>

      <footer className="mt-12 text-gray-600 text-[10px] uppercase tracking-[0.2em]">
        © 2026 • Eleições Escolares
      </footer>
    </div>
  );
}