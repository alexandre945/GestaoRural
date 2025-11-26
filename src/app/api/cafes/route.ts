import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("cafes").select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
  
// CADASTRAR UM NOVO CAFÉ
export async function POST(req: Request) {
  const body = await req.json();
  const { nome } = body;

  if (!nome) {
    return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabase.
  from("cafes")
  .insert([{ nome }])
  .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Café cadastrado", data }, { status: 201 });
}
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return Response.json({ error: "ID é obrigatório" }, { status: 400 });
  }

  const { error } = await supabase.from("cafes").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Café excluído com sucesso" }, { status: 200 });
}

       