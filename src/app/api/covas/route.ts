import { supabase } from "@/lib/supabase";
console.log("ROTA COVAS CARREGADA");

export async function POST(request: Request) {
  const body = await request.json();
  const { data, quantidade, talhao_id, trabalhadores } = body;

  if (!data || !quantidade || !talhao_id) {
    return new Response(
      JSON.stringify({ error: "data, quantidade e talhao_id são obrigatórios" }),
      { status: 400 }
    );
  }

  // 1️⃣ Criar registro da cova
  const { data: novaCova, error: erroCova } = await supabase
    .from("covas")
    .insert([{ data, quantidade, talhao_id }])
    .select("*");

  if (erroCova) {
    return new Response(JSON.stringify({ error: erroCova.message }), {
      status: 500,
    });
  }

  const covaId = novaCova[0].id;

  // 2️⃣ Registrar trabalhadores envolvidos
  if (trabalhadores && trabalhadores.length > 0) {
    const registros = trabalhadores.map((trabalhador_id: number) => ({
      cova_id: covaId,
      trabalhador_id,
    }));

    const { error: erroTrabalhadores } = await supabase
      .from("covas_trabalhadores")
      .insert(registros);

    if (erroTrabalhadores) {
      return new Response(JSON.stringify({ error: erroTrabalhadores.message }), {
        status: 500,
      });
    }
  }

  return Response.json(novaCova[0]);
}
//rota get para buscar numeros de covas de um trabalhador pelo id

   export async function GET() {
  const { data, error } = await supabase
    .from("covas")
.select(`
  id,
  data,
  quantidade,
  talhao_id,
  talhoes!inner ( nome ),
  covas_trabalhadores (
    trabalhador_id,
    trabalhadores!inner ( nome, valor_diaria )
  )
`)

    .order("id", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data);
}

   //rota delete para deletar uma cova pelo id
   export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
      status: 400,
    });
  }

  // 1️⃣ Apagar os trabalhadores relacionados
  const { error: errorRelacionados } = await supabase
    .from("covas_trabalhadores")
    .delete()
    .eq("cova_id", Number(id));

  if (errorRelacionados) {
    return new Response(JSON.stringify({ error: errorRelacionados.message }), {
      status: 500,
    });
  }

  // 2️⃣ Apagar a cova em si
  const { error } = await supabase
    .from("covas")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json({ message: "Cova removida com sucesso" });
}

    //rota put para atualizar uma cova pelo id

    export async function PUT(request: Request) {
  const body = await request.json();
  const { id, data, quantidade, talhao_id, trabalhadores } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
      status: 400,
    });
  }

  // 1️⃣ Atualizar a própria cova
  const { data: updated, error: erroUpdate } = await supabase
    .from("covas")
    .update({
      ...(data && { data }),
      ...(quantidade && { quantidade }),
      ...(talhao_id && { talhao_id }),
    })
    .eq("id", id)
    .select("*");

  if (erroUpdate) {
    return new Response(JSON.stringify({ error: erroUpdate.message }), {
      status: 500,
    });
  }

  // 2️⃣ Atualizar trabalhadores relacionados
  if (trabalhadores) {
    // apagar os antigos
    await supabase
      .from("covas_trabalhadores")
      .delete()
      .eq("cova_id", id);

    // inserir os novos
    const registros = trabalhadores.map((trabalhador_id: number) => ({
      cova_id: id,
      trabalhador_id,
    }));

    const { error: erroInsert } = await supabase
      .from("covas_trabalhadores")
      .insert(registros);

    if (erroInsert) {
      return new Response(JSON.stringify({ error: erroInsert.message }), {
        status: 500,
      });
    }
  }

  return Response.json(updated[0]);
}


