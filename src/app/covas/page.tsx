"use client";

import { useEffect, useState } from "react";

export default function CovasPage() {
  const [covas, setCovas] = useState<any[]>([]);
  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [trabalhadores, setTrabalhadores] = useState<any[]>([]);

  const [data, setData] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [talhaoId, setTalhaoId] = useState("");
  const [trabalhadoresSelecionados, setTrabalhadoresSelecionados] = useState<
    number[]
  >([]);

  const carregar = async () => {
    const resCovas = await fetch("/api/covas");
    const listaCovas = await resCovas.json();
    setCovas(listaCovas);

    const resTalhoes = await fetch("/api/talhoes");
    setTalhoes(await resTalhoes.json());

    const resTrab = await fetch("/api/trabalhadores");
    setTrabalhadores(await resTrab.json());
  };

  useEffect(() => {
    carregar();
  }, []);

  const criar = async () => {
    await fetch("/api/covas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        quantidade: Number(quantidade),
        talhao_id: Number(talhaoId),
        trabalhadores: trabalhadoresSelecionados,
      }),
    });

    setData("");
    setQuantidade("");
    setTalhaoId("");
    setTrabalhadoresSelecionados([]);

    carregar();
  };

  const deletar = async (id: number) => {
    await fetch(`/api/covas?id=${id}`, { method: "DELETE" });
    carregar();
  };

  const toggleTrabalhador = (id: number) => {
    setTrabalhadoresSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🌱 Registrar Covas</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow mb-8 space-y-4">

        <input
          type="date"
          className="p-2 border rounded w-full"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <input
          type="number"
          placeholder="Quantidade de covas"
          className="p-p2 border rounded w-full"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />

        {/* SELECT TALHÃO */}
        <select
          className="p-2 border rounded w-full"
          value={talhaoId}
          onChange={(e) => setTalhaoId(e.target.value)}
        >
          <option value="">Selecione um Talhão</option>
          {talhoes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>

        {/* MULTI SELECT TRABALHADORES */}
        <div className="border p-3 rounded">
          <p className="font-semibold mb-2">Trabalhadores envolvidos:</p>

          {trabalhadores.map((t) => (
            <label key={t.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={trabalhadoresSelecionados.includes(t.id)}
                onChange={() => toggleTrabalhador(t.id)}
              />
              {t.nome} — R$ {t.valor_diaria.toFixed(2).replace(".", ",")}
            </label>
          ))}
        </div>

        <button
          onClick={criar}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Registrar Cova
        </button>
      </div>

      {/* LISTAGEM */}
      <h2 className="text-xl font-bold mb-3">📋 Registros</h2>

      <div className="space-y-4">
        {covas.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded shadow">
            <p><b>Data:</b> {c.data}</p>
            <p><b>Quantidade:</b> {c.quantidade}</p>

            {/* CORREÇÃO FINAL DO TALHÃO */}
            <p>
              <b>Talhão:</b> {c.talhoes?.[0]?.nome ?? "Desconhecido"}
            </p>

            <p className="mt-2">
              <b>Trabalhadores:</b>
            </p>

            <ul className="list-disc pl-6">
              {c.covas_trabalhadores?.map((ct: any) => {
                const trab = ct.trabalhadores?.[0];
                return (
                  <li key={ct.trabalhador_id}>
                    {trab?.nome ?? "Sem nome"} — 
                    R$ {trab?.valor_diaria?.toFixed(2).replace(".", ",") ?? "0,00"}
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => deletar(c.id)}
              className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
