"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";
import { supabase } from "@/lib/supabase";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const changaOne = Changa_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error" as "error" | "success",
  });

  const router = useRouter();

  const showModal = (
    title: string,
    message: string,
    type: "error" | "success" = "error"
  ) => {
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
      showModal(
        "Dados incompletos",
        "Preencha a matrícula e a data de nascimento completa."
      );
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
        if (aluno.is_active === true || aluno.is_active === "true") {
          showModal(
            "Voto já registrado",
            "Você já participou desta eleição."
          );
          setLoading(false);

          setTimeout(() => window.location.reload(), 4000);
          return;
        }

        if (aluno.data_nascimento === dataFormatadaUSA) {
          localStorage.setItem("aluno_sessao", JSON.stringify(aluno));
          router.push("/votacao");
          return;
        } else {
          showModal("Acesso negado", "Data de nascimento incorreta.");
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
          showModal("Erro", "Dados do docente incorretos.");
          setLoading(false);
          return;
        }
      }

      showModal("Não encontrado", "Matrícula não localizada.");
    } catch (err) {
      console.error(err);
      showModal("Erro", "Falha na conexão com o sistema.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">

      {/* MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-[#334155] w-full max-w-sm rounded-2xl p-8 shadow-xl">

            <div
              className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-xl font-bold ${
                modal.type === "error"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {modal.type === "error" ? "!" : "✓"}
            </div>

            <h3 className={`${bungee.className} text-lg text-white`}>
              {modal.title}
            </h3>

            <p className="text-gray-400 text-sm mt-2 mb-6">
              {modal.message}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className={`${bungee.className} text-4xl md:text-5xl text-blue-400`}>
          ELEIÇÕES DO GRÊMIO
        </h1>

        <p
          className={`${changaOne.className} text-gray-400 mt-2 uppercase text-xs tracking-widest`}
        >
          Portal oficial de votação estudantil
        </p>
      </div>

      {/* CARD */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full bg-[#1E293B] border border-[#334155] rounded-2xl p-8 shadow-xl">

        {/* FORM */}
        <div>
          <h2 className={`${bungee.className} text-xl text-white`}>
            Acesso ao sistema
          </h2>

          <p className="text-gray-400 text-sm mb-6">
            Informe seus dados para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-xs text-gray-400 font-semibold">
                Matrícula
              </label>

              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full mt-1 p-3 bg-[#020617] border border-[#334155] rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-white"
                placeholder="Digite sua matrícula"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold">
                Data de nascimento
              </label>

              <input
                type="text"
                value={password}
                onChange={handlePasswordChange}
                className="w-full mt-1 p-3 bg-[#020617] border border-[#334155] rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-white"
                placeholder="DD/MM/AAAA"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* IMAGEM */}
        <div className="hidden md:flex flex-col items-center justify-center border-l border-[#334155] pl-6">
          <div className="relative w-[260px] h-[260px]">
            <Image
              src="/acesso.jpeg"
              alt="Grêmio Estudantil"
              fill
              className="rounded-xl object-cover"
              priority
            />
          </div>

          <p className="text-gray-500 text-sm text-center mt-6 italic">
            "A participação fortalece a democracia na escola."
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-10 text-gray-500 text-xs uppercase tracking-widest">
        © 2026 • Sistema de votação estudantil
      </footer>
    </div>
  );
}