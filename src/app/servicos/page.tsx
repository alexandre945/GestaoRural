"use client";

import { useEffect, useState } from "react";

export default function ServicosPage() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [exigeQuantidade, setExigeQuantidade] = useState(false);

  const carregar = async () => {
    const res = await fetch("/api/servicos");
    const lista = await res.json();
    setServicos(lista);
  };

  useEffect(() => {
    carregar();
  }, []);

  const criar = async () => {
    if (!nome.trim()) {
      alert("O nome do serviço é obrigatório.");
      return;
    }

    await fetch("/api/servicos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        exige_quantidade: exigeQuantidade,
      }),
    });

    setNome("");
    setExigeQuantidade(false);
    carregar();
  };

  const deletar = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    await fetch(`/api/servicos?id=${id}`, { method: "DELETE" });
    carregar();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🛠️ Serviços</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow mb-8 space-y-4">

        <input
          type="text"
          placeholder="Nome do serviço"
          className="p-2 border rounded w-full"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={exigeQuantidade}
            onChange={() => setExigeQuantidade(!exigeQuantidade)}
          />
          O serviço exige quantidade?
        </label>

        <button
          onClick={criar}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Criar Serviço
        </button>
      </div>

      {/* LISTAGEM */}
      <h2 className="text-xl font-bold mb-3">📋 Serviços cadastrados</h2>

      <div className="space-y-4">
        {servicos.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded shadow">
            <p>
              <b>Serviço:</b> {s.nome}
            </p>
            <p>
              <b>Exige quantidade?</b>{" "}
              {s.exige_quantidade ? "Sim" : "Não"}
            </p>

            <button
              onClick={() => deletar(s.id)}
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
