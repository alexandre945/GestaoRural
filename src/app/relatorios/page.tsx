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

      {carregando && <p>Carregando...</p>}

      {resultado && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="text-xl font-bold mb-2">📅 {resultado.data}</h2>

          <p><b>Total de covas:</b> {resultado.total_covas}</p>

          <div>
            <h3 className="font-semibold mb-2">🌱 Covas por talhão:</h3>
            <ul className="list-disc pl-6">
              {resultado.por_talhao.map((item: any, idx: number) => (
                <li key={idx}>
                  <b>{item.talhao}</b>: {item.covas}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">👷 Trabalhadores:</h3>
            <ul className="list-disc pl-6">
              {resultado.trabalhadores_envolvidos.map((t: any, idx: number) => (
                <li key={idx}>{t.nome} — R$ {t.valor_diaria}</li>
              ))}
            </ul>
          </div>

          <p><b>Total mão de obra:</b> R$ {resultado.total_mao_de_obra}</p>
        </div>
      )}
    </div>
  );
}
