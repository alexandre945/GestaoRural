import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { nome, valor_diaria } = body;

  if (!nome || !valor_diaria) {
    return new Response(
      JSON.stringify({ error: "Nome e valor_diaria são obrigatórios" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("trabalhadores")
    .insert([{ nome, valor_diaria }])
    .select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data[0]);
}

//rota para listar todos os trabalhadores
export async function GET() {
  const { data, error } = await supabase
    .from("trabalhadores")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data);
}
 //rota para deletar um trabalhador pelo id
 export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
      status: 400,
    });
  }

  const { error } = await supabase
    .from("trabalhadores")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json({ message: "Trabalhador removido com sucesso" });
}
//  rota para atualizar um trabalhador pelo id
export async function PUT(request: Request) {
  const body = await request.json();
  const { id, nome, valor_diaria } = body;

  if (!id || !nome || !valor_diaria) {
    return new Response(
      JSON.stringify({ error: "ID, nome e valor_diaria são obrigatórios" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("trabalhadores")
    .update({ nome, valor_diaria })
    .eq("id", id)
    .select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data[0]);
}

 

