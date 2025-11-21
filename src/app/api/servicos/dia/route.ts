import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { data, servico_id, cafe_id, quantidade, trabalhadores } = body;

  if (!data || !servico_id) {
    return Response.json(
      { error: "data e servico_id são obrigatórios" },
      { status: 400 }
    );
  }

  const { data: novoServico, error: erroServico } = await supabase
    .from("servicos_dia")
    .insert([
      {
        data,
        servico_id,
        cafe_id: cafe_id || null,
        quantidade: quantidade || null,
      },
    ])
    .select("*")
    .single();

  if (erroServico) {
    return Response.json({ error: erroServico.message }, { status: 500 });
  }

  if (trabalhadores && trabalhadores.length > 0) {
    const registros = trabalhadores.map((trabalhador_id: number) => ({
      servico_dia_id: novoServico.id,
      trabalhador_id,
    }));

    const { error: erroTrab } = await supabase
      .from("servicos_trabalhadores")
      .insert(registros);

    if (erroTrab) {
      return Response.json({ error: erroTrab.message }, { status: 500 });
    }
  }

  return Response.json(novoServico);
}

export async function GET() {
  const { data, error } = await supabase
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
    .order("id", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID é obrigatório" }, { status: 400 });
  }

  await supabase
    .from("servicos_trabalhadores")
    .delete()
    .eq("servico_dia_id", Number(id));

  const { error } = await supabase
    .from("servicos_dia")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ mensagem: "Serviço removido com sucesso" });
}
