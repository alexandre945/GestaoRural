"use client";

import { useEffect, useState } from "react";

export default function CafesPage() {
  const [nome, setNome] = useState("");
  const [cafes, setCafes] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [editando, setEditando] = useState(false);
  const [idEdicao, setIdEdicao] = useState<number | null>(null);

  function iniciarEdicao(cafe: any) {
  setEditando(true);       // muda o formulário para modo edição
  setNome(cafe.nome);      // preenche o input com o nome atual
  setIdEdicao(cafe.id);    // guarda o id que será atualizado
}


  async function carregarCafes() {
    const res = await fetch("/api/cafes");
    const data = await res.json();
    setCafes(data);
  }

async function atualizarCafe(e: React.FormEvent) {
  e.preventDefault();

  const res = await fetch("/api/cafes", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: idEdicao, nome }),
  });

  const resposta = await res.json();
  setMensagem(resposta.message);

  setNome("");
  setIdEdicao(null);
  setEditando(false);

  carregarCafes();

  setTimeout(() => setMensagem(""), 3000);
}



  async function cadastrarCafe(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/cafes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    const resposta = await res.json();
    setMensagem(resposta.message);
    setNome("");
    carregarCafes();
    setTimeout(() => setMensagem(""), 3000);
  }

  async function excluirCafe(id: number) {
    const res = await fetch("/api/cafes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const resposta = await res.json();
    setMensagem(resposta.message);
    carregarCafes();
    setTimeout(() => setMensagem(""), 3000);
  }

  useEffect(() => {
    carregarCafes();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto" suppressHydrationWarning>
      <h1 className="text-2xl font-bold text-center">Cadastro de Cafés ☕</h1>

      {mensagem && (
        <p className="bg-green-100 text-green-700 border border-green-300 p-2 rounded text-center">
          {mensagem}
        </p>
      )}

      <form onSubmit={editando ? atualizarCafe : cadastrarCafe} className="flex flex-col sm:flex-row gap-2">

        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do café (ex: Catuaí Amarelo)"
          className="flex-1 border rounded p-2"
          required
        />
       <button className="bg-green-600  px-2 py-2 rounded hover:bg-green-700 mx-2 sm:mx-4 mb-2">
          {editando ? "Atualizar" : "Salvar"}
       </button>

      </form>

      <ul className="space-y-2 mt-4">
        {cafes.map((cafe) => (
          <li
            key={cafe.id}
            className="flex items-center justify-between bg-gray-900 border border-gray-700 p-3 rounded-lg"
          >
            <span className="text-lg font-medium text-white">{cafe.nome}</span>

          <div className="flex gap-2">
            <button
              onClick={() => iniciarEdicao(cafe)}
              className="flex items-center gap-1 px-2 py-[2px] text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800 transition"
            >
              <span className="text-[12px]">✏️</span> Editar
            </button>

            <button
              onClick={() => excluirCafe(cafe.id)}
              className="flex items-center gap-1 px-2 py-[2px] text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 active:bg-red-800 transition"
            >
              <span className="text-[12px]">🗑</span> Excluir
            </button>
          </div>

          </li>
        ))}
      </ul>

    </div>
  );
}
