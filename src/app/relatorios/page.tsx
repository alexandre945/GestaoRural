"use client";

import { useState } from "react";

export default function RelatorioPage() {
  const [data, setData] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

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
      <div className="bg-white p-4 rounded shadow mb-6 space-y-4">
        <input
          type="date"
          className="p-2 border rounded w-full"
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
      {carregando && <p>Carregando relatório...</p>}

      {/* RESULTADO */}
      {resultado && (
        <div className="bg-white p-4 rounded shadow space-y-6">

          <h2 className="text-xl font-bold">📅 {resultado.data}</h2>

          {/* ----------------- COVAS ----------------------------- */}
          <div>
            <h3 className="text-lg font-semibold">🌱 COVAS</h3>

            <p>
              <b>Total de covas:</b> {resultado.total_covas}
            </p>

            <h4 className="font-semibold mt-3">Por talhão:</h4>
            <ul className="list-disc pl-6">
              {resultado.por_talhao.map((item: any, idx: number) => (
                <li key={idx}>
                  <b>{item.talhao}:</b> {item.covas}
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

                // pegar trabalhadores de cada cova
                const trabalhadoresCovas = resultado.covas
                  .flatMap((c: any) =>
                    c.covas_trabalhadores.map((ct: any) => {
                      const trab = Array.isArray(ct.trabalhadores)
                        ? ct.trabalhadores[0]
                        : ct.trabalhadores;
                      return trab;
                    })
                  )
                  .filter(Boolean);

                // eliminar duplicados
                const unicos = trabalhadoresCovas.filter(
                  (t: any, i: number, arr: any[]) =>
                    i === arr.findIndex((x) => x.id === t.id)
                );

                return (
                  <ul className="list-disc pl-6">
                    {unicos.map((t: any, idx: number) => (
                      <li key={idx}>
                        {t.nome} — R$ {t.valor_diaria}
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

            {resultado.servicos.length === 0 && (
              <p>Nenhum serviço registrado.</p>
            )}

            {resultado.servicos.map((s: any, idx: number) => {
              const trabalhadores =
                s.servicos_trabalhadores?.map((st: any) => {
                  const trab = Array.isArray(st.trabalhadores)
                    ? st.trabalhadores[0]
                    : st.trabalhadores;
                  return trab;
                }) || [];

                const nomeCafe = s.cafes?.nome || "Café não informado";

              return (
                <div key={idx} className="border rounded p-3 mt-3">
                  <h4 className="font-semibold">
                   SERVIÇO:  {s.servicos?.nome || "Serviço"}
                  </h4>
                  <h4 className="font-semibold">
                    LOCAL:  {nomeCafe} — 
                  </h4>
              
                  {/* QUANTIDADE */}
                  {s.servicos?.exige_quantidade && (
                    <p>
                      Quantidade: <b>{(s.quantidade).toLocaleString("pt-BR")}</b>
                    </p>
                  )}

                  {/* TRABALHADORES DO SERVIÇO */}
                  <p className="mt-2 font-semibold">👷 Trabalhadores:</p>
                  {trabalhadores.length === 0 ? (
                    <p>Nenhum trabalhador vinculado.</p>
                  ) : (
                    <ul className="list-disc pl-6">
                      {trabalhadores.map((t: any, i: number) => (
                        <li key={i}>
                          {t.nome} — {Number(t.valor_diaria).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </li>
                      ))}
                    </ul>
                  )}
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

        </div>
      )}
    </div>
  );
}
