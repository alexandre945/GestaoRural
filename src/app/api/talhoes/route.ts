import { supabase } from "@/lib/supabase";
  
        //rota post
export async function POST(request: Request) {
  const body = await request.json();

  const { nome } = body; 

  if (!nome) {
    return new Response(JSON.stringify({ error: "Nome é obrigatório" }), {
      status: 400,
    });
  }

  const { data, error } = await supabase
    .from("talhoes")
    .insert([{ nome }])
    .select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data[0]);
}
     //rota get
export async function GET() {
  const { data, error } = await supabase
    .from("talhoes")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data);
}

           //rota delete

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
      status: 400,
    });
  }

  const { error } = await supabase
    .from("talhoes")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json({ message: "Talhão removido com sucesso" });
}
      //rota put
      
      export async function PUT(request: Request) {
  const body = await request.json();
  const { id, nome } = body;

  if (!id || !nome) {
    return new Response(
      JSON.stringify({ error: "ID e nome são obrigatórios" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("talhoes")
    .update({ nome })
    .eq("id", id)
    .select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data[0]);
}



