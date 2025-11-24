"use client";

import { useEffect, useState } from "react";

type CoffeeData = {
  sacaReais: number;
  precoGlobalCents: number;
  usdbrl: number;
};

export default function Home() {
  const [preco, setPreco] = useState<CoffeeData | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("/api/coffee-price");
        const json = await res.json();
        setPreco(json);
      } catch (error) {
        console.error("Erro ao buscar preço:", error);
      }
    };

    fetchPrice();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      
      {/* CARD DA COTAÇÃO */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 w-full max-w-sm text-center">
        <h2 className="text-lg font-bold">☕ Valor da Saca de Café (60 kg)</h2>

        {preco?.sacaReais ? (
          <>
            <p className="mt-2 text-2xl font-bold text-green-700">
              R$ {preco.sacaReais.toLocaleString("pt-BR")}
            </p>

            <p className="text-xs text-gray-600 mt-2">
              🌍 Preço global: {preco.precoGlobalCents} ¢/lb <br />
              💵 USD/BRL: {preco.usdbrl}
            </p>
          </>
        ) : (
          <p className="text-gray-500">Carregando preço...</p>
        )}
      </div>

      {/* MENU DE AÇÕES */}
      <h1 className="text-2xl font-bold mb-8">Sistema de Cavação de Café</h1>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <a
          href="/talhoes"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold"
        >
          🌱 Talhões
        </a>

        <a
          href="/trabalhadores"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold"
        >
          👨‍🌾 Trabalhadores
        </a>

        <a
          href="/covas"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold"
        >
          🕳️ Covas
        </a>

        <a
          href="/relatorios"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold"
        >
          📊 Relatórios
        </a>

        <a
          href="/relatorios/semana"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold"
        >
          📆 Relatório Semanal
        </a>

        <a
          href="/servicos"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold"
        >
          🛠️ Serviços
        </a>

        <a
          href="/servicos/dia"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold"
        >
          🛠️ Registrar Serviço do Dia
        </a>
      </div>
    </div>
  );
}
