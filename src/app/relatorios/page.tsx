"use client";

import { useState } from "react";

type RelatorioTalhao = {
  talhao: string;
  covas: number;
};

type RelatorioTrabalhador = {
  nome: string;
  valor_diaria: number;
};

type RelatorioDia = {
  data: string;
  total_covas: number;
  por_talhao: RelatorioTalhao[];
  trabalhadores_envolvidos: RelatorioTrabalhador[];
  total_mao_de_obra: number;
};

export default function RelatorioPage() {
  const [data, setData] = useState("");
  const [resultado, setResultado] = useState<RelatorioDia | null>(null);
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

      {/* RESULTADO */}
      {carregando && <p>Carregando relatório...</p>}

      {resultado && (
        <div className="bg-white p-4 rounded shadow space-y-4">

          <h2 className="text-xl font-bold mb-2">📅 {resultado.data}</h2>

          <p className="text-lg">
            <b>Total de covas no dia:</b> {resultado.total_covas}
          </p>

          <div>
            <h3 className="font-semibold mb-2">🌱 Covas por talhão:</h3>

            {resultado.por_talhao.length === 0 ? (
              <p>Nenhum talhão registrado.</p>
            ) : (
              <ul className="list-disc pl-6">
                {resultado.por_talhao.map((item, idx) => (
                  <li key={idx}>
                    <b>{item.talhao}</b>: {item.covas}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">👷‍♂️ Trabalhadores envolvidos:</h3>

            {resultado.trabalhadores_envolvidos.length === 0 ? (
              <p>Nenhum trabalhador registrado.</p>
            ) : (
              <ul className="list-disc pl-6">
                {resultado.trabalhadores_envolvidos.map((t, idx) => (
                  <li key={idx}>
                    {t.nome} — R$ {t.valor_diaria}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-lg">
            <b>Total mão de obra:</b> R$ {resultado.total_mao_de_obra}
          </p>

        </div>
      )}

    </div>
  );
}
