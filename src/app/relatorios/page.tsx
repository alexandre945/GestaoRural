"use client";

import { useEffect, useState } from "react";

export default function RelatorioPage() {
  const [data, setData] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const [mounted, setMounted] = useState(false); // 👈 EVITA HYDRATION ERROR

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // 👈 IMPEDE RENDER NO SSR

  const gerarRelatorio = async () => {
    if (!data) return alert("Selecione uma data.");

    setCarregando(true);
    setResultado(null);

    const res = await fetch(`/api/relatorios/dia?data=${data}`);
    const json = await res.json();

    setResultado(json);
    setCarregando(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Relatório Diário</h1>

      {/* FORM */}
      <div className="border p-4 rounded shadow mb-6 space-y-4">
        <input
          type="date"
          className="
            p-2 border rounded w-full
            bg-gray-900 text-white
            [&::-webkit-calendar-picker-indicator]:opacity-100
            [&::-webkit-calendar-picker-indicator]:invert
          "
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <button
          onClick={gerarRelatorio}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Gerar Relatório
        </button>
      </div>

      {/* LOADING */}
      {carregando && (
        <div className="flex justify-center my-6">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* RESULTADO */}
      {resultado && (
        <div className="border p-4 rounded shadow space-y-6">

          <h2 className="text-xl font-bold">📅 {resultado.data}</h2>

          {/* ----------------- COVAS ----------------------------- */}
          <div>
            <h3 className="text-lg font-semibold">🌱 COVAS</h3>

            <p>
              <b>Total de covas:</b>{" "}
              {resultado.total_covas.toLocaleString("pt-BR")}
            </p>

            <h4 className="font-semibold mt-3">Por talhão:</h4>
            <ul className="list-disc pl-6">
              {resultado.por_talhao.map((item: any, idx: number) => (
                <li key={idx}>
                  <b>{item.talhao}:</b> {item.covas.toLocaleString("pt-BR")}
                </li>
              ))}
            </ul>

            {/* TRABALHADORES DAS COVAS */}
            <div>
              <h3 className="font-semibold mt-2">👷 Trabalhadores das covas:</h3>

              {(() => {
                if (!resultado.covas || resultado.covas.length === 0) {
                  return <p>Nenhum trabalhador registrado nas covas.</p>;
                }

                const trabalhadoresCovas = resultado.covas
                  .flatMap((c: any) =>
                    c.covas_trabalhadores.map((ct: any) => {
                      return Array.isArray(ct.trabalhadores)
                        ? ct.trabalhadores[0]
                        : ct.trabalhadores;
                    })
                  )
                  .filter(Boolean);

                const unicos = trabalhadoresCovas.filter(
                  (t: any, i: number, arr: any[]) =>
                    i === arr.findIndex((x) => x.id === t.id)
                );

                return (
                  <ul className="list-disc pl-6">
                    {unicos.map((t: any, idx: number) => (
                      <li key={idx}>
                        {t.nome} —{" "}
                        {Number(t.valor_diaria).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>

          {/* ----------------- SERVIÇOS ----------------------------- */}
          <div>
            <h3 className="text-lg font-semibold">🛠 SERVIÇOS</h3>

            {resultado.servicos.length === 0 && <p>Nenhum serviço registrado.</p>}

            {resultado.servicos.map((s: any, idx: number) => {
              const trabalhadores =
                s.servicos_trabalhadores?.map((st: any) =>
                  Array.isArray(st.trabalhadores)
                    ? st.trabalhadores[0]
                    : st.trabalhadores
                ) || [];

              // 👈 AGORA O NOME DO CAFÉ ESTÁ CORRETO POR SERVIÇO
              const nomeCafe = Array.isArray(s.cafes)
                ? s.cafes[0]?.nome || "Café não informado"
                : s.cafes?.nome || "Café não informado";

              return (
                <div key={idx} className="border rounded p-3 mt-3">
                  <h4 className="font-semibold">
                    SERVIÇO: {s.servicos?.nome}
                  </h4>

                  <h4 className="font-semibold">
                    LOCAL: {nomeCafe}
                  </h4>

                  {s.servicos?.exige_quantidade && (
                    <p>
                      Quantidade:{" "}
                      <b>{Number(s.quantidade).toLocaleString("pt-BR")}</b>
                    </p>
                  )}

                  <p className="mt-2 font-semibold">👷 Trabalhadores:</p>
                  <ul className="list-disc pl-6">
                    {trabalhadores.map((t: any, i: number) => (
                      <li key={i}>
                        {t.nome} —{" "}
                        {Number(t.valor_diaria).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* ----------------- TOTAL GERAL ----------------------------- */}
          <p className="text-lg mt-4">
            <b>Total mão de obra:</b>{" "}
            {Number(resultado.total_mao_de_obra).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p className="text-lg mt-2">
            <b>Total geral plantado:</b>{" "}
            {resultado.total_geral_plantado.toLocaleString("pt-BR")} mudas
          </p>
        </div>
      )}
    </div>
  );
}
