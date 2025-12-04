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

  // ------------------------------------------
  // 1️⃣ HISTÓRICO DE PLANTAÇÃO (TOTAL GERAL)
  // ------------------------------------------

  const SERVICO_PLANTACAO_ID = 7; // ID do serviço PLANTIO

  const { data: historicoPlantioRaw } = await supabase
    .from("servicos_dia")
    .select(`
      quantidade,
      cafe_id
    `)
    .eq("servico_id", SERVICO_PLANTACAO_ID);

  const historicoPlantio = historicoPlantioRaw ?? [];

  const total_geral_plantado = historicoPlantio.reduce(
    (acc, item) => acc + (Number(item.quantidade) || 0),
    0
  );

// NOME DO CAFÉ VINCULADO À PLANTAÇÃO
let nome_cafe_historico = null;

// procurar o primeiro registro que realmente tenha um cafe_id
const primeiroComCafe = historicoPlantio.find((item) => item.cafe_id);

if (primeiroComCafe?.cafe_id) {
  const { data: cafeInfo } = await supabase
    .from("cafes")
    .select("nome")
    .eq("id", primeiroComCafe.cafe_id)
    .single();

  nome_cafe_historico = cafeInfo?.nome || null;
}


  // ------------------------------------------
  // 2️⃣ COVAS DO DIA
  // ------------------------------------------

  const { data: covas, error: erroCovas } = await supabase
    .from("covas")
    .select(`
      id,
      data,
      quantidade,
      talhoes ( id, nome ),
      covas_trabalhadores (
        trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .eq("data", dataFiltro);

  if (erroCovas) {
    return Response.json({ error: erroCovas.message }, { status: 500 });
  }

  const total_covas = covas?.reduce((acc, c) => acc + c.quantidade, 0) || 0;

  const por_talhao: Record<string, number> = {};
  covas?.forEach((c) => {
    const talhaoObj = Array.isArray(c.talhoes) ? c.talhoes[0] : c.talhoes;
    por_talhao[talhaoObj?.nome ?? "Talhão Desconhecido"] =
      (por_talhao[talhaoObj?.nome ?? "Talhão Desconhecido"] || 0) + c.quantidade;
  });

  // ------------------------------------------
  // 3️⃣ SERVIÇOS DO DIA + AJUSTE ROÇADEIRA = 130
  // ------------------------------------------

  const { data: servicosDia, error: erroServ } = await supabase
    .from("servicos_dia")
    .select(`
      id,
      quantidade,
      cafe_id,
      cafes: cafe_id ( id, nome ),
      servicos ( nome ),
      servicos_trabalhadores (
      trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .eq("data", dataFiltro);

  if (erroServ) {
    return Response.json({ error: erroServ.message }, { status: 500 });
  }

  const servicosAjustados = servicosDia.map((s: any) => {
    const nomeServico = s.servicos?.nome?.toLowerCase();
    const isRocadeira =
      nomeServico === "roçadeira" || nomeServico === "rocadeira";

    if (isRocadeira) {
      s.servicos_trabalhadores = s.servicos_trabalhadores.map((st: any) => ({
        ...st,
        trabalhadores: {
          ...st.trabalhadores,
          valor_diaria: 130, // 👈 diária diferenciada
        },
      }));
    }

    return s;
  });

  // ------------------------------------------
  // 4️⃣ TRABALHADORES ENVOLVIDOS + TOTAL MÃO DE OBRA
  // ------------------------------------------

  const trabMap = new Map<string, number>();

  covas?.forEach((c) => {
    c.covas_trabalhadores?.forEach((ct: any) => {
      trabMap.set(ct.trabalhadores.nome, ct.trabalhadores.valor_diaria);
    });
  });

  servicosAjustados.forEach((s: any) => {
    s.servicos_trabalhadores?.forEach((st: any) => {
      trabMap.set(st.trabalhadores.nome, st.trabalhadores.valor_diaria);
    });
  });

  const trabalhadores_envolvidos = Array.from(trabMap.entries()).map(
    ([nome, valor]) => ({ nome, valor_diaria: valor })
  );

  const total_mao_de_obra = trabalhadores_envolvidos.reduce(
    (acc, t) => acc + Number(t.valor_diaria),
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
    trabalhadores_envolvidos,
    total_mao_de_obra,
    servicos: servicosAjustados,
  });
}
