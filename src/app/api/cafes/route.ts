import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase.from("cafes").select("*").order("id");

  if (error) {
    return NextResponse.json({ message: "Erro ao buscar cafés" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { nome } = await req.json();

  if (!nome || nome.trim() === "") {
    return NextResponse.json({ message: "Nome do café é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("cafes")
    .insert([{ nome: nome.trim() }])
    .select("id, nome");

  if (error) {
    return NextResponse.json(
      { message: "Erro ao salvar café: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Café cadastrado com sucesso! ☕",
    cafe: data[0],
  });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ message: "ID do café é obrigatório" }, { status: 400 });
  }

  const { error } = await supabase.from("cafes").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: "Erro ao excluir café: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Café removido com sucesso! 🗑️" });
}
export async function PUT(req: Request) {
  const { id, nome } = await req.json();

  if (!id || !nome || nome.trim() === "") {
    return NextResponse.json(
      { message: "ID e nome são obrigatórios" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("cafes")
    .update({ nome: nome.trim() })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: "Erro ao atualizar café: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Café atualizado com sucesso! ✏️" });
}

