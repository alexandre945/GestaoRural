import { supabase } from "@/lib/supabase";

// Helpers sem depender de date-fns
function formatISO(d: Date) {
  return d.toISOString().slice(0, 10); // yyyy-MM-dd
}
function formatBR(d: Date) {
  return d.toLocaleDateString("pt-BR");
}

// Segunda a sábado da semana
function getWeekRange(base: Date) {
  const day = base.getDay();
  const diffToMonday = (day + 6) % 7;

  const inicio = new Date(base);
  inicio.setDate(base.getDate() - diffToMonday);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 5);
  fim.setHours(23, 59, 59, 999);

  return { inicio, fim };
}



export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataFiltro = searchParams.get("data");

  if (!dataFiltro) {
    return Response.json({ error: "Use ?data=YYYY-MM-DD" }, { status: 400 });
  }

  const base = new Date(dataFiltro);
  if (isNaN(base.getTime())) {
    return Response.json({ error: "Data inválida." }, { status: 400 });
  }

  const { inicio, fim } = getWeekRange(base);

  const DIARIA_NORMAL = 120;
  const DIARIA_ROCADEIRA = 130;

  // 1️⃣ COVAS NA SEMANA
  const { data: covas } = await supabase
    .from("covas")
    .select(`
      data,
      covas_trabalhadores (
        trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .gte("data", formatISO(inicio))
    .lte("data", formatISO(fim));

  // 2️⃣ SERVIÇOS NA SEMANA + NOME DO SERVIÇO
  const { data: servicos } = await supabase
    .from("servicos_dia")
    .select(`
      data,
      servicos ( nome ),
      servicos_trabalhadores (
        trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .gte("data", formatISO(inicio))
    .lte("data", formatISO(fim));

  // 3️⃣ Mapa trabalhador → dias e valores diários
  const trabMap = new Map<
    number,
    { nome: string; valores: number[] }
  >();

  // --- COVAS (sempre diária normal)
  covas?.forEach((c) => {
    c.covas_trabalhadores?.forEach((ct) => {
      const tr = Array.isArray(ct.trabalhadores)
        ? ct.trabalhadores[0]
        : ct.trabalhadores;

      if (!tr) return;

      if (!trabMap.has(tr.id)) {
        trabMap.set(tr.id, { nome: tr.nome, valores: [] });
      }

      trabMap.get(tr.id)!.valores.push(DIARIA_NORMAL);
    });
  });

  // --- SERVIÇOS
 servicos?.forEach((s: any) => {
  const servicoNome = Array.isArray(s.servicos)
    ? s.servicos[0]?.nome?.toLowerCase()
    : s.servicos?.nome?.toLowerCase();

  const isRocadeira =
    servicoNome === "roçadeira" || servicoNome === "rocadeira";

  s.servicos_trabalhadores?.forEach((st: any) => {
    const tr = Array.isArray(st.trabalhadores)
      ? st.trabalhadores[0]
      : st.trabalhadores;

    if (!tr) return;

    if (!trabMap.has(tr.id)) {
      trabMap.set(tr.id, { nome: tr.nome, valores: [] });
    }

    trabMap.get(tr.id)!.valores.push(
      isRocadeira ? DIARIA_ROCADEIRA : DIARIA_NORMAL
    );
  });
});

  // 4️⃣ Resultado final
  const trabalhadores = Array.from(trabMap.entries()).map(([id, obj]) => {
    const dias = obj.valores.length;
    const total = obj.valores.reduce((acc, v) => acc + v, 0);

    return {
      id,
      nome: obj.nome,
      dias_trabalhados: dias,
      valor_diaria: DIARIA_NORMAL, // exibição padrão
      total_semana: total,
    };
  });

  const total_geral = trabalhadores.reduce((acc, t) => acc + t.total_semana, 0);

  return Response.json({
    semana: {
      inicio: formatBR(inicio),
      fim: formatBR(fim),
    },
    trabalhadores,
    total_geral,
  });
}
