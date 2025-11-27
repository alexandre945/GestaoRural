"use client";

import { useEffect, useState } from "react";

export default function CafesPage() {
  const [nome, setNome] = useState("");
  const [cafes, setCafes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  async function carregarCafes() {
    const res = await fetch("/api/cafes");
    const data = await res.json();
    setCafes(data);
  }

  async function cadastrarCafe(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/cafes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });

    const resposta = await res.json();
    setMensagem(resposta.message); // pega mensagem da API

    setNome(""); // limpa input
    carregarCafes();

    setTimeout(() => setMensagem(""), 3000); // limpa mensagem depois
  }

  async function excluirCafe(id: number) {
    const res = await fetch("/api/cafes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const resposta = await res.json();
    setMensagem(resposta.message); // mensagem do delete

    carregarCafes();

    setTimeout(() => setMensagem(""), 3000);
  }

  useEffect(() => {
    carregarCafes();
  }, []);

  return (

    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold text-center">Cadastro de Cafés ☕</h1>

      {/* Mensagem de feedback */}
      {mensagem && (
        <p className="bg-green-100 text-green-700 border border-green-300 p-2 rounded text-center">
          {mensagem}
        </p>
      )}

      {/* Formulário */}
      <form onSubmit={cadastrarCafe} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do café (ex: Catuaí Amarelo)"
          className="flex-1 border rounded p-2"
          required
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 
                    mx-2 sm:mx-4 mb-2">
          Salvar
        </button>
      </form>

      {/* Lista de cafés */}
      <ul className="space-y-2">
        {cafes.map((cafe: any) => (
          <li
            key={cafe.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            {cafe.nome}

            <button
              onClick={() => excluirCafe(cafe.id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
