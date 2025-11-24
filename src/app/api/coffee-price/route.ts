export const dynamic = "force-dynamic";

const KG_POR_LIBRA = 0.453592;
const SACA_KG = 60;

export async function GET() {
  try {
    // Buscando Coffee Futures (Arabica)
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/KC=F?interval=1d";

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return Response.json({ error: "Falha na API do Yahoo" }, { status: 500 });
    }

    const json = await res.json();

    // Preço atual (US cents/lb)
    const precoCents = json.chart.result[0].meta.regularMarketPrice;

    // USD/BRL também pelo Yahoo
    const fxRes = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/USDBRL=X?interval=1d",
      { cache: "no-store" }
    );

    const fxJson = await fxRes.json();
    const usdbrl = fxJson.chart.result[0].meta.regularMarketPrice;

    // Conversão
    const usdPorLibra = precoCents / 100;
    const usdPorKg = usdPorLibra / KG_POR_LIBRA;
    const usdPorSaca = usdPorKg * SACA_KG;
    const reaisPorSaca = usdPorSaca * usdbrl;

    return Response.json({
      precoGlobalCents: precoCents,
      usdbrl,
      sacaReais: Number(reaisPorSaca.toFixed(2)),
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
