import { supabase } from "@/lib/supabase";

// Helpers de data sem depender de date-fns
function formatISODate(d: Date) {
  // yyyy-MM-dd
  return d.toISOString().slice(0, 10);
}

function formatBRDate(d: Date) {
  // dd/mm/aaaa
  return d.toLocaleDateString("pt-BR");
}

// Calcula segunda e sábado da semana da data base
function getWeekRange(base: Date) {
  // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const day = base.getDay();

  // Quantos dias passaram desde segunda
  const diffToMonday = (day + 6) % 7; // segunda = 1 → 0, terça = 2 → 1, domingo = 0 → 6

  const inicio = new Date(base);
  inicio.setDate(base.getDate() - diffToMonday);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 5); // segunda + 5 = sábado
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

  // Data base
  const dataBase = new Date(dataFiltro);
  if (isNaN(dataBase.getTime())) {
    return Response.json(
      { error: "Data inválida. Use o formato YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const { inicio, fim } = getWeekRange(dataBase);

  // Buscar covas da semana (segunda → sábado)
  const { data: covas, error } = await supabase
    .from("covas")
    .select(`
      id,
      data,
      covas_trabalhadores (
        trabalhador_id,
        trabalhadores ( id, nome, valor_diaria )
      )
    `)
    .gte("data", formatISODate(inicio))
    .lte("data", formatISODate(fim));

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!covas || covas.length === 0) {
    return Response.json({
      semana: {
        inicio: formatBRDate(inicio),
        fim: formatBRDate(fim),
      },
      trabalhadores: [],
      total_geral: 0,
    });
  }

  // Mapa: trabalhador_id -> { nome, valor_diaria, dias:Set<string> }
  const trabMap = new Map<
    number,
    { nome: string; valor_diaria: number; dias: Set<string> }
  >();

  covas.forEach((cova: any) => {
    const dia = cova.data as string;

    cova.covas_trabalhadores?.forEach((ct: any) => {
      const trabRaw = ct.trabalhadores as any;
      if (!trabRaw) return;

      // Pode vir como objeto ou array, tratamos os dois jeitos
      const trab = Array.isArray(trabRaw) ? trabRaw[0] : trabRaw;
      if (!trab) return;

      const id = trab.id as number;
      const nome = trab.nome as string;
      const valor_diaria = Number(trab.valor_diaria) || 0;

      if (!trabMap.has(id)) {
        trabMap.set(id, {
          nome,
          valor_diaria,
          dias: new Set<string>(),
        });
      }

      // Cada dia trabalhado conta 1 diária
      trabMap.get(id)!.dias.add(dia);
    });
  });

  const trabalhadores = Array.from(trabMap.entries()).map(([id, obj]) => {
    const dias_trabalhados = obj.dias.size;
    const total_semana = dias_trabalhados * obj.valor_diaria;

    return {
      id,
      nome: obj.nome,
      dias_trabalhados,
      valor_diaria: obj.valor_diaria,
      total_semana,
    };
  });

  const total_geral = trabalhadores.reduce(
    (acc, t) => acc + t.total_semana,
    0
  );

  return Response.json({
    semana: {
      inicio: formatBRDate(inicio),
      fim: formatBRDate(fim),
    },
    trabalhadores,
    total_geral,
  });
}
