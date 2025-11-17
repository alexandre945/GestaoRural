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

  // Busca das covas do dia com talhão e trabalhadores
  const { data, error } = await supabase
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

  // força para any[] pra não brigar com os tipos gerados do Supabase
  const covas = (data ?? []) as any[];

  if (!covas || covas.length === 0) {
    return Response.json({
      data: dataFiltro,
      total_covas: 0,
      por_talhao: [],
      trabalhadores_envolvidos: [],
      total_mao_de_obra: 0,
    });
  }

  // ---------- TOTAL DE COVAS ----------
  const total_covas = covas.reduce(
    (acc, c) => acc + (c.quantidade ?? 0),
    0
  );

  // ---------- AGRUPAR COVAS POR TALHÃO ----------
  const por_talhao: Record<string, number> = {};

  covas.forEach((c) => {
    const talhoesRaw = c.talhoes;

    // pode vir como objeto OU array → trata os dois casos
    let talhaoNome: string | undefined;

    if (Array.isArray(talhoesRaw)) {
      talhaoNome = talhoesRaw[0]?.nome;
    } else if (talhoesRaw && typeof talhoesRaw === "object") {
      talhaoNome = talhoesRaw.nome;
    }

    const chave = talhaoNome || "Talhão Desconhecido";

    por_talhao[chave] = (por_talhao[chave] || 0) + (c.quantidade ?? 0);
  });

  // ---------- TRABALHADORES ENVOLVIDOS (únicos) ----------
  const trabMap = new Map<string, number>();

  covas.forEach((c) => {
    const rels = c.covas_trabalhadores ?? [];

    rels.forEach((ct: any) => {
      const trabRaw = ct.trabalhadores;

      let trab: any | undefined;

      if (Array.isArray(trabRaw)) {
        trab = trabRaw[0];
      } else {
        trab = trabRaw;
      }

      if (trab?.nome) {
        // se o mesmo trabalhador aparecer em várias covas, mantém 1 diária só
        trabMap.set(trab.nome, trab.valor_diaria ?? 0);
      }
    });
  });

  const trabalhadores_envolvidos = Array.from(trabMap.entries()).map(
    ([nome, valor_diaria]) => ({
      nome,
      valor_diaria,
    })
  );

  // ---------- TOTAL DE MÃO DE OBRA ----------
  const total_mao_de_obra = trabalhadores_envolvidos.reduce(
    (acc, t) => acc + (t.valor_diaria ?? 0),
    0
  );

  // ---------- RESPOSTA FINAL ----------
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
