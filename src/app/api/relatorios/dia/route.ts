import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataFiltro = searchParams.get("data");

  if (!dataFiltro) {
    return new Response(
      JSON.stringify({ error: "A data é obrigatória (?data=YYYY-MM-DD)" }),
      { status: 400 }
    );
  }

  const { data: covas, error } = await supabase
    .from("covas")
    .select(`
      id,
      data,
      quantidade,
      talhao_id,
      talhoes ( id, nome ),
      covas_trabalhadores (
        trabalhador_id,
        trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .eq("data", dataFiltro);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (!covas || covas.length === 0) {
    return Response.json({
      data: dataFiltro,
      total_covas: 0,
      por_talhao: [],
      trabalhadores_envolvidos: [],
      total_mao_de_obra: 0,
    });
  }

  const total_covas = covas.reduce((acc, c) => acc + c.quantidade, 0);

  const por_talhao: Record<string, number> = {};

  covas.forEach((c) => {
    const nomeTalhao = Array.isArray(c.talhoes)
      ? c.talhoes[0]?.nome
      : c.talhoes?.nome;

    const chave = nomeTalhao ?? "Talhão Desconhecido";
    por_talhao[chave] = (por_talhao[chave] || 0) + c.quantidade;
  });

  const trabMap = new Map<string, number>();

  covas.forEach((c) => {
    c.covas_trabalhadores?.forEach((ct) => {
      const trab = Array.isArray(ct.trabalhadores)
        ? ct.trabalhadores[0]
        : ct.trabalhadores;

      if (trab) {
        trabMap.set(trab.nome, trab.valor_diaria);
      }
    });
  });

  const trabalhadores_envolvidos = Array.from(trabMap.entries()).map(
    ([nome, valor_diaria]) => ({
      nome,
      valor_diaria,
    })
  );

  const total_mao_de_obra = trabalhadores_envolvidos.reduce(
    (acc, t) => acc + t.valor_diaria,
    0
  );

  return Response.json({
    data: dataFiltro,
    total_covas,
    por_talhao: Object.entries(por_talhao).map(([talhao, covas]) => ({
      talhao,
      covas,
    })),
    trabalhadores_envolvidos,
    total_mao_de_obra,
  });
}
