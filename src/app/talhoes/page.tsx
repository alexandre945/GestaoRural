"use client";

import { useEffect, useState } from "react";

export default function TalhoesPage() {
  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [nome, setNome] = useState("");

  // Carregar talhões
  const carregarTalhoes = async () => 
  {
    const res = await fetch("/api/talhoes");
    const data = await res.json();
    setTalhoes(data);
  };

  useEffect(() => {
    carregarTalhoes();
  }, []);

  // Criar talhão
  const criarTalhao = async () => {
    await fetch("/api/talhoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });

    setNome("");
    carregarTalhoes();
  };

  // Deletar talhão
  const deletarTalhao = async (id: number) => {
    await fetch(`/api/talhoes?id=${id}`, { method: "DELETE" });
    carregarTalhoes();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🌱 Talhões</h1>

      {/* Criar talhão */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Nome do talhão"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <button
          onClick={criarTalhao}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Adicionar
        </button>
      </div>

      {/* Lista */}
      <ul className="space-y-3">
        {talhoes.map((t) => (
          <li
            key={t.id}
            className="bg-white p-3 rounded shadow flex justify-between"
          >
            <span>{t.nome}</span>

            <button
              onClick={() => deletarTalhao(t.id)}
              className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
