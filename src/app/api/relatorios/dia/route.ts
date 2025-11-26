import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataFiltro = searchParams.get("data");

  if (!dataFiltro) {
    return Response.json(
      { error: "A data é obrigatória (?data=YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const SERVICO_PLANTACAO_ID = 7;

  // HISTÓRICO DE PLANTAÇÃO DE CAFÉ (TODOS OS DIAS)
  const { data: historicoPlantio } = await supabase
    .from("servicos_dia")
    .select(`
      quantidade,
      cafe_id,
      servicos ( id, nome )
    `)
    .eq("servico_id", SERVICO_PLANTACAO_ID);

  const total_geral_plantado =
    historicoPlantio?.reduce(
      (acc, item) => acc + (Number(item.quantidade) || 0),
      0
    ) || 0;

  // BUSCA NOME DO CAFÉ PELO cafe_id DO HISTÓRICO
  let nome_cafe_historico = "Café não informado";

  if (historicoPlantio && historicoPlantio.length > 0) {
    const cafeId = historicoPlantio[0].cafe_id;

    if (cafeId) {
      const { data: cafeInfo } = await supabase
        .from("cafes")
        .select("nome")
        .eq("id", cafeId)
        .single();

      nome_cafe_historico = cafeInfo?.nome || "Café não informado";
    }
  }

  // COVAS DO DIA
  const { data: covas, error: erroCovas } = await supabase
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

  // SERVIÇOS DO DIA
  const { data: servicos, error: erroServ } = await supabase
    .from("servicos_dia")
    .select(`
      id,
      data,
      quantidade,
      cafe_id,
      servicos ( id, nome, exige_quantidade ),
      servicos_trabalhadores (
        trabalhador_id,
        trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .eq("data", dataFiltro);

  if (erroCovas || erroServ) {
    return Response.json(
      { error: erroCovas?.message || erroServ?.message },
      { status: 500 }
    );
  }

  // SOMA TOTAL DE COVAS NO DIA
  const total_covas = covas?.reduce((acc, c) => acc + c.quantidade, 0) || 0;

  // COVAS POR TALHÃO
  const por_talhao: Record<string, number> = {};

  covas?.forEach((c) => {
    const talhaoObj = Array.isArray(c.talhoes) ? c.talhoes[0] : c.talhoes;
    const nomeTalhao = talhaoObj?.nome ?? "Talhão Desconhecido";
    por_talhao[nomeTalhao] = (por_talhao[nomeTalhao] || 0) + c.quantidade;
  });

  // TRABALHADORES ENVOLVIDOS
  const trabMap = new Map<string, number>();

  covas?.forEach((c) => {
    c.covas_trabalhadores?.forEach((ct) => {
      const trab = Array.isArray(ct.trabalhadores)
        ? ct.trabalhadores[0]
        : ct.trabalhadores;

      if (trab) trabMap.set(trab.nome, trab.valor_diaria);
    });
  });

  servicos?.forEach((s) => {
    s.servicos_trabalhadores?.forEach((st) => {
      const trab = Array.isArray(st.trabalhadores)
        ? st.trabalhadores[0]
        : st.trabalhadores;

      if (trab) trabMap.set(trab.nome, trab.valor_diaria);
    });
  });

  const trabalhadores_envolvidos = Array.from(trabMap.entries()).map(
    ([nome, valor]) => ({ nome, valor_diaria: valor })
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
    total_geral_plantado,
    nome_cafe_historico,
    covas,
    trabalhadores_envolvidos,
    total_mao_de_obra,
    servicos,
  });
}
