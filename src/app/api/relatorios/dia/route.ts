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

  // BUSCA COVAS + SERVIÇOS NO MESMO DIA
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

  const { data: servicos, error: erroServ } = await supabase
    .from("servicos_dia")
    .select(`
      id,
      data,
      quantidade,
      cafes ( id, nome ),
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

  // ------------------ SOMA TOTAL DE COVAS ------------------
  const total_covas = covas?.reduce((acc, c) => acc + c.quantidade, 0) || 0;

  // ------------------ AGRUPAR COVAS POR TALHÃO ------------------
  const por_talhao: Record<string, number> = {};

  covas?.forEach((c) => {
    const talhaoObj = Array.isArray(c.talhoes) ? c.talhoes[0] : c.talhoes;
    const nomeTalhao = talhaoObj?.nome ?? "Talhão Desconhecido";

    por_talhao[nomeTalhao] = (por_talhao[nomeTalhao] || 0) + c.quantidade;
  });

  // ------------------ TRABALHADORES DO DIA ------------------
  const trabMap = new Map<string, number>();

  // Covas
  covas?.forEach((c) => {
    c.covas_trabalhadores?.forEach((ct) => {
      const raw = ct.trabalhadores;
      const trab = Array.isArray(raw) ? raw[0] : raw;
      if (trab) trabMap.set(trab.nome, trab.valor_diaria);
    });
  });

  // Serviços
  servicos?.forEach((s) => {
    s.servicos_trabalhadores?.forEach((st) => {
      const raw = st.trabalhadores;
      const trab = Array.isArray(raw) ? raw[0] : raw;
      if (trab) trabMap.set(trab.nome, trab.valor_diaria);
    });
  });

  const trabalhadores_envolvidos = Array.from(trabMap.entries()).map(
    ([nome, valor]) => ({
      nome,
      valor_diaria: valor,
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
  covas, // <-- ADICIONE ISSO
  trabalhadores_envolvidos,
  total_mao_de_obra,
  servicos,
});

}
