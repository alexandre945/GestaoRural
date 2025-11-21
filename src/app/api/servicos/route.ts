import { supabase } from "@/lib/supabase";

// GET — listar serviços
export async function GET() {
  const { data, error } = await supabase.from("servicos").select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// POST — criar serviço
export async function POST(req: Request) {
  const body = await req.json();
  const { nome, exige_quantidade } = body;

  const { data, error } = await supabase
    .from("servicos")
    .insert([{ nome, exige_quantidade }])
    .select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data[0]);
}

// DELETE — apagar serviço
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID é obrigatório" }, { status: 400 });
  }

  const { error } = await supabase.from("servicos").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Serviço removido com sucesso" });
}

// PUT — editar serviço
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, nome, exige_quantidade } = body;

  if (!id) {
    return Response.json({ error: "ID é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("servicos")
    .update({
      ...(nome && { nome }),
      ...(exige_quantidade !== undefined && { exige_quantidade }),
    })
    .eq("id", id)
    .select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data[0]);
}
