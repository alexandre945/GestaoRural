"use client";

import { useEffect, useState } from "react";

export default function ServicosDiaPage() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [trabalhadores, setTrabalhadores] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);

  const [data, setData] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [cafeId, setCafeId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [trabalhadoresSelecionados, setTrabalhadoresSelecionados] = useState<number[]>([]);

  const carregar = async () => {
    const resServ = await fetch("/api/servicos");
    setServicos(await resServ.json());

    const resCafe = await fetch("/api/cafes");
    setCafes(await resCafe.json());

    const resTrab = await fetch("/api/trabalhadores");
    setTrabalhadores(await resTrab.json());

    const resReg = await fetch("/api/servicos/dia");
    setRegistros(await resReg.json());
  };

  useEffect(() => {
    carregar();
  }, []);

  const toggleTrab = (id: number) => {
    setTrabalhadoresSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const criar = async () => {
    if (!data || !servicoId) {
      alert("Data e serviço são obrigatórios!");
      return;
    }

    await fetch("/api/servicos/dia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        servico_id: Number(servicoId),
        cafe_id: cafeId ? Number(cafeId) : null,
        quantidade: quantidade ? Number(quantidade) : null,
        trabalhadores: trabalhadoresSelecionados,
      }),
    });

    setData("");
    setServicoId("");
    setCafeId("");
    setQuantidade("");
    setTrabalhadoresSelecionados([]);

    carregar();
  };

  const deletar = async (id: number) => {
    if (!confirm("Excluir este registro?")) return;

    await fetch(`/api/servicos/dia?id=${id}`, { method: "DELETE" });
    carregar();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🗓️ Registrar Serviço do Dia</h1>

      {/* FORM */}
      <div className=" p-4 rounded shadow mb-8 space-y-4">

        <input
          type="date"
          className="p-2 border rounded w-full"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        {/* SELECT SERVIÇO */}
        <select
          className="p-2 border rounded w-full"
          value={servicoId}
          onChange={(e) => setServicoId(e.target.value)}
        >
          <option value="">Selecione o serviço</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>

        {/* SELECT CAFÉ (opcional) */}
        <select
          className="p-2 border rounded w-full"
          value={cafeId}
          onChange={(e) => setCafeId(e.target.value)}
        >
          <option value="">Selecione o café (opcional)</option>
          {cafes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        {/* QUANTIDADE (só quando exige quantidade) */}
        {servicos.find((s) => s.id == servicoId)?.exige_quantidade && (
          <input
            type="number"
            className="p-2 border rounded w-full"
            value={quantidade}
            placeholder="Quantidade"
            onChange={(e) => setQuantidade(e.target.value)}
          />
        )}

        {/* TRABALHADORES */}
        <div className="border p-3 rounded">
          <p className="font-semibold mb-2">Trabalhadores envolvidos:</p>

          {trabalhadores.map((t) => (
            <label key={t.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={trabalhadoresSelecionados.includes(t.id)}
                onChange={() => toggleTrab(t.id)}
              />
              {t.nome} — R$ {t.valor_diaria.toFixed(2).replace(".", ",")}
            </label>
          ))}
        </div>

        <button
          onClick={criar}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Registrar
        </button>
      </div>

      {/* LISTAGEM */}
      <h2 className="text-xl font-bold mb-3">📋 Registros</h2>

      <div className="space-y-4">
        {registros.map((r) => (
          <div key={r.id} className="border p-4 rounded shadow">

            <p><b>Data:</b> {r.data}</p>
            <p><b>Serviço:</b> {r.servicos?.nome}</p>
            {r.servicos?.exige_quantidade && (
              <p><b>Quantidade:</b> {r.quantidade}</p>
            )}
            <p><b>Café:</b> {r.cafes?.nome ?? "—"}</p>

            <p className="mt-2"><b>Trabalhadores:</b></p>
            <ul className="list-disc pl-6">
              {r.servicos_trabalhadores?.map((ct: any) => (
                <li key={ct.trabalhador_id}>
                  {ct.trabalhadores.nome} — R$ {ct.trabalhadores.valor_diaria}
                </li>
              ))}
            </ul>

            <button
              onClick={() => deletar(r.id)}
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
