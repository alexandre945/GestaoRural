"use client";

import { useEffect, useState } from "react";

export default function TrabalhadoresPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");

  const carregar = async () => {
    const res = await fetch("/api/trabalhadores");
    const data = await res.json();
    setLista(data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const criar = async () => {
    await fetch("/api/trabalhadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        valor_diaria: Number(valor),
      }),
    });

    setNome("");
    setValor("");
    carregar();
  };

  const deletar = async (id: number) => {
    await fetch(`/api/trabalhadores?id=${id}`, {
      method: "DELETE",
    });

    carregar();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👨‍🌾 Trabalhadores</h1>

      {/* Criar trabalhador */}
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="w-32 p-2 border rounded"
          type="number"
          placeholder="Diária"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <button
          onClick={criar}
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          Adicionar
        </button>
      </div>

      {/* Lista */}
      <ul className="space-y-3">
        {lista.map((t) => (
          <li
            key={t.id}
            className="bg-white p-3 rounded shadow flex justify-between"
          >
            <span>
              {t.nome} — R$ {t.valor_diaria.toFixed(2).replace(".", ",")}
            </span>

            <button
              onClick={() => deletar(t.id)}
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
