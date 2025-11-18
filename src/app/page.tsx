export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
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

        <a href="/relatorios/semana" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center font-semibold" >
         📆 Relatório Semanal
        </a>
      </div>
    </div>
  );
}
