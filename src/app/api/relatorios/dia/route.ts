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

  // Buscar covas + talhão + trabalhadores
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
    return Response.json({ error: error.message }, { status: 500 });
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

  // Total geral
  const total_covas = covas.reduce((acc, c) => acc + c.quantidade, 0);

  // AGRUPAR TALHÃO (OBJETO)
  const por_talhao: Record<string, number> = {};
  covas.forEach((c) => {
    const nomeTalhao = c.talhoes?.nome ?? "Talhão Desconhecido";
    por_talhao[nomeTalhao] = (por_talhao[nomeTalhao] || 0) + c.quantidade;
  });

  // TRABALHADORES (OBJETO)
  const trabMap = new Map<string, number>();

  covas.forEach((c) => {
    c.covas_trabalhadores?.forEach((ct) => {
      const t = ct.trabalhadores;
      if (t) {
        trabMap.set(t.nome, t.valor_diaria);
      }
    });
  });

  const trabalhadores_envolvidos = Array.from(trabMap).map(([nome, valor]) => ({
    nome,
    valor_diaria: valor,
  }));

  const total_mao_de_obra = trabalhadores_envolvidos.reduce(
    (acc, t) => acc + t.valor_diaria,
    0
  );

  // Saída final
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
