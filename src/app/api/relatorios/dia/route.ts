import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return new Response(JSON.stringify({ error: "A data é obrigatória" }), {
      status: 400,
    });
  }

  const { data: covas, error } = await supabase
    .from("covas")
    .select(`
      id,
      quantidade,
      talhoes ( nome ),
      covas_trabalhadores (
        trabalhadores ( nome, valor_diaria )
      )
    `)
    .eq("data", data);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (covas.length === 0) {
    return Response.json({
      data,
      total_covas: 0,
      por_talhao: [],
      trabalhadores_envolvidos: [],
      total_mao_de_obra: 0,
    });
  }

  const total_covas = covas.reduce((sum, c) => sum + c.quantidade, 0);
  const por_talhao: Record<string, number> = {};

covas.forEach((c) => {
  const nome =
    c.talhoes?.nome ??
    c.talhoes?.[0]?.nome ??
    "Talhão Desconhecido";

  por_talhao[nome] = (por_talhao[nome] || 0) + c.quantidade;
});

const trabalhadoresMap = new Map();

covas.forEach((c) => {
  c.covas_trabalhadores.forEach((t) => {

    const trab =
      t.trabalhadores?.nome
        ? t.trabalhadores
        : t.trabalhadores?.[0] ?? null;

    if (trab) {
      trabalhadoresMap.set(trab.nome, trab.valor_diaria);
    }

  });
});


  return Response.json({
    data,
    total_covas,
    por_talhao: Object.entries(por_talhao).map(([talhao, covas]) => ({
      talhao,
      covas,
    })),
    trabalhadores_envolvidos,
    total_mao_de_obra,
  });
}
