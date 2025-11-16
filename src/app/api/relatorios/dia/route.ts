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

  // Buscar todas as covas do dia, incluindo talhão e trabalhadores
  const { data: covas, error } = await supabase
    .from("covas")
    .select(`
      id,
      data,
      quantidade,
      talhao_id,
      talhoes ( nome ),
      covas_trabalhadores (
        trabalhador_id,
        trabalhadores ( nome, valor_diaria )
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

  // ---------- SOMA TOTAL DE COVAS ----------
  const total_covas = covas.reduce((acc, c) => acc + c.quantidade, 0);

  // ---------- AGRUPAR COVAS POR TALHÃO ----------
  const por_talhao: Record<string, number> = {};

  covas.forEach((c) => {
    // talhoes pode vir como array OU objeto → tratar seguro
    const nomeTalhao = Array.isArray(c.talhoes)
      ? c.talhoes[0]?.nome
      : c.talhoes?.nome;
 
    const chave = nomeTalhao ?? "Talhão Desconhecido";

    por_talhao[chave] = (por_talhao[chave] || 0) + c.quantidade;
  });

  // ---------- TRABALHADORES ENVOLVIDOS (únicos) ----------
  const trabalhadoresMap = new Map<string, number>();

  covas.forEach((c) => {
    c.covas_trabalhadores.forEach((t) => {
      // trabalhadores pode vir como array OU objeto
      const trab = Array.isArray(t.trabalhadores)
        ? t.trabalhadores[0]
        : t.trabalhadores;

      if (trab) {
        trabalhadoresMap.set(trab.nome, trab.valor_diaria);
      }
    });
  });

  const trabalhadores_envolvidos = Array.from(trabalhadoresMap).map(
    ([nome, valor]) => ({
      nome,
      valor_diaria: valor,
    })
  );

  // ---------- TOTAL DE MÃO DE OBRA ----------
  const total_mao_de_obra = trabalhadores_envolvidos.reduce(
    (acc, t) => acc + t.valor_diaria,
    0
  );

  // ----------- RETORNO FINAL DO RELATÓRIO ---------
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
