"use client";

import { useState } from "react";

type TrabalhadorSemana = {
  id: number;
  nome: string;
  dias_trabalhados: number;
  valor_diaria: number;
  total_semana: number;
};

type RelatorioSemana = {
  semana: {
    inicio: string;
    fim: string;
  };
  trabalhadores: TrabalhadorSemana[];
  total_geral: number;
};

export default function RelatorioSemanaPage() {
  const [data, setData] = useState("");
  const [resultado, setResultado] = useState<RelatorioSemana | null>(null);
  const [carregando, setCarregando] = useState(false);

  const gerarRelatorio = async () => {
    if (!data) {
      alert("Selecione uma data.");
      return;
    }

    setCarregando(true);
    setResultado(null);

    const res = await fetch(`/api/relatorios/semana?data=${data}`);
    const json = await res.json();

    setResultado(json);
    setCarregando(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-2">📆 Relatório Semanal de Diárias</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <p className="text-sm text-gray-600">
          Escolha uma data. O sistema vai calcular a semana de{" "}
          <b>segunda a sábado</b> que contém essa data.
        </p>

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
      {carregando && <p>Carregando relatório semanal...</p>}

      {resultado && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="text-xl font-bold mb-2">
            📆 Semana {resultado.semana.inicio} → {resultado.semana.fim}
          </h2>

          <div>
            <h3 className="font-semibold mb-2">👷 Trabalhadores</h3>

            {resultado.trabalhadores.length === 0 ? (
              <p>Nenhum registro nesta semana.</p>
            ) : (
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">Trabalhador</th>
                    <th className="border px-2 py-1 text-center">
                      Dias trabalhados
                    </th>
                    <th className="border px-2 py-1 text-right">
                      Valor diária (R$)
                    </th>
                    <th className="border px-2 py-1 text-right">
                      Total na semana (R$)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.trabalhadores.map((t) => (
                    <tr key={t.id}>
                      <td className="border px-2 py-1">{t.nome}</td>
                      <td className="border px-2 py-1 text-center">
                        {t.dias_trabalhados}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {t.valor_diaria.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {t.total_semana.toFixed(2).replace(".", ",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-lg font-semibold text-right">
            Total geral na semana:{" "}
            R$ {resultado.total_geral.toFixed(2).replace(".", ",")}
          </p>
        </div>
      )}
    </div>
  );
}
