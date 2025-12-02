"use client";

import { useEffect, useState } from "react";

type CoffeeData = {
  sacaReais: number;
  precoGlobalCents: number;
  usdbrl: number;
  tipo6Brasil: number;
  atualizado: string;
};

export default function Home() {
  const [preco, setPreco] = useState<CoffeeData | null>(null);

  useEffect(() => {
    fetch("/api/coffee-price")
      .then((res) => res.json())
      .then(setPreco)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">

      {/* CARD DA COTAÇÃO */}
      {preco ? (
        <div className=" p-5 rounded-lg shadow w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-3">☕ Cotação da Saca de Café (60kg)</h2>

           <p className="text-lg font-semibold text-green-700">
              🌍 Bolsa NY Convertida: <br />
              <span className="text-2xl">
                {preco.sacaReais
                  ? `R$ ${preco.sacaReais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : "Buscando..."}
              </span>
            </p>
            
            {/* <p className="mt-4 text-lg font-semibold text-blue-700">
              🇧🇷 Mercado Físico Tipo 6 Bebida Dura: <br />
              <span className="text-2xl">
                {preco.tipo6Brasil
                  ? `R$ ${preco.tipo6Brasil.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : "Não disponível"}
              </span>
            </p> */}

          <p className="text-xs text-gray-600 mt-4">
            Preço Global: {preco.precoGlobalCents} ¢/lb — USD/BRL: {preco.usdbrl}
            <br />
            📅 Atualizado em: {preco.atualizado}
          </p>
        </div>
      ) : (
        <p className="">Carregando cotação...</p>
      )}

      {/* MENU DE AÇÕES */}
      <h1 className="text-2xl font-bold mt-10 mb-6">Sistema de Cavação de Café</h1>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <a href="/talhoes" className="border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          🌱 Talhões
        </a>

        <a href="/trabalhadores" className=" border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          👨‍🌾 Trabalhadores
        </a>

        <a href="/cafes" className="border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          ☕ Cafés
        </a>

        <a href="/covas" className="border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          🕳️ Covas
        </a>

        <a href="/relatorios" className="border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          📊 Relatórios Diaríos
        </a>

        <a href="/relatorios/semana" className="border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          📆 Relatório Semanal
        </a>

        <a href="/servicos" className="border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          🛠️ Serviços
        </a>

        <a href="/servicos/dia" className="border p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold">
          🛠️ Registrar Serviço do Dia
        </a>
      </div>
    </div>
  );
}
