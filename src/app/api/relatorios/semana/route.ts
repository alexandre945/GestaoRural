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
    return Response.json(
      { error: "Use ?data=YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const base = new Date(dataFiltro);
  if (isNaN(base.getTime())) {
    return Response.json(
      { error: "Data inválida." },
      { status: 400 }
    );
  }

  const { inicio, fim } = getWeekRange(base);

  // =======================
  // 1️⃣ Buscar COVAS da semana
  // =======================
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

  // =======================
  // 2️⃣ Buscar SERVIÇOS da semana
  // =======================
  const { data: servicos } = await supabase
    .from("servicos_dia")
    .select(`
      data,
      servicos_trabalhadores (
        trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .gte("data", formatISO(inicio))
    .lte("data", formatISO(fim));

  // =======================
  // 3️⃣ Monta mapa geral
  // trabalhador_id → dias trabalhados, nome e valor
  // =======================
  const trabMap = new Map<
    number,
    { nome: string; valor_diaria: number; dias: Set<string> }
  >();

  // ---- COVAS ----
  covas?.forEach((cova) => {
    const dia = cova.data;

    cova.covas_trabalhadores?.forEach((ct) => {
      const raw = ct.trabalhadores;
      const tr = Array.isArray(raw) ? raw[0] : raw;
      if (!tr) return;

      if (!trabMap.has(tr.id)) {
        trabMap.set(tr.id, {
          nome: tr.nome,
          valor_diaria: Number(tr.valor_diaria),
          dias: new Set(),
        });
      }

      trabMap.get(tr.id)!.dias.add(dia);
    });
  });

  // ---- SERVIÇOS ----
  servicos?.forEach((serv) => {
    const dia = serv.data;

    serv.servicos_trabalhadores?.forEach((st) => {
      const raw = st.trabalhadores;
      const tr = Array.isArray(raw) ? raw[0] : raw;
      if (!tr) return;

      if (!trabMap.has(tr.id)) {
        trabMap.set(tr.id, {
          nome: tr.nome,
          valor_diaria: Number(tr.valor_diaria),
          dias: new Set(),
        });
      }

      trabMap.get(tr.id)!.dias.add(dia);
    });
  });

  // =======================
  // 4️⃣ Lista final
  // =======================
  const trabalhadores = Array.from(trabMap.entries()).map(([id, obj]) => {
    const dias = obj.dias.size;
    const total = dias * obj.valor_diaria;

    return {
      id,
      nome: obj.nome,
      dias_trabalhados: dias,
      valor_diaria: obj.valor_diaria,
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
