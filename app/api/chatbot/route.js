import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Cliente server-side com service_role (ignora RLS)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function autenticar(req) {
  const secret = process.env.CHATBOT_SECRET;
  // Rejeita se a variável de ambiente não estiver configurada
  if (!secret) return false;
  return req.headers.get("x-chatbot-secret") === secret;
}

// ── POST /api/chatbot ─────────────────────────────────────────────────────────
// Registra uma movimentação (entrada ou saída) vinda do n8n/Telegram
export async function POST(req) {
  if (!autenticar(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { tipo, item_nome, serial, patrimonio, categoria, qty, funcionario, departamento, obs, operador, unidade } = body;
  const unidadeNorm = (unidade || "florianopolis").toLowerCase();

  // Validações básicas
  if (!tipo || !["entrada", "saida", "saída"].includes(tipo.toLowerCase())) {
    return NextResponse.json({ error: "Campo 'tipo' deve ser 'entrada' ou 'saida'" }, { status: 400 });
  }
  if (!item_nome) {
    return NextResponse.json({ error: "Campo 'item_nome' é obrigatório" }, { status: 400 });
  }
  if (!qty || qty < 1) {
    return NextResponse.json({ error: "Campo 'qty' deve ser um número positivo" }, { status: 400 });
  }

  const tipoNorm = tipo.toLowerCase() === "entrada" ? "entrada" : "saida";
  const isEntrada = tipoNorm === "entrada";
  const supabase = getSupabaseAdmin();

  // Busca o equipamento pelo nome (busca parcial, case-insensitive) na unidade correta
  const { data: equipamentos } = await supabase
    .from("equipamentos")
    .select("*")
    .ilike("nome", `%${item_nome}%`)
    .eq("unidade", unidadeNorm)
    .limit(5);

  let equipId = null;
  let qtdTotalFinal = qty;
  let qtdDispFinal = qty;
  let nomeRegistro = item_nome;
  let catRegistro = categoria || "—";
  let serialReg = serial || "—";
  let patReg = patrimonio || "—";
  let estoqueAtual = null;

  if (equipamentos && equipamentos.length > 0) {
    const equip = equipamentos[0];
    equipId = equip.id;
    nomeRegistro = equip.nome;
    catRegistro = equip.categoria || catRegistro;
    serialReg = serial || equip.serial || "—";
    patReg = patrimonio || equip.patrimonio || "—";

    if (isEntrada) {
      qtdTotalFinal = equip.qtd_total + qty;
      qtdDispFinal = equip.qtd_disponivel + qty;

      const { data: updated } = await supabase
        .from("equipamentos")
        .update({ qtd_total: qtdTotalFinal, qtd_disponivel: qtdDispFinal, status: "Disponível" })
        .eq("id", equip.id)
        .select()
        .single();

      estoqueAtual = updated;
    } else {
      // Saída: verifica se há estoque suficiente
      if (equip.qtd_disponivel < qty) {
        return NextResponse.json({
          error: `Estoque insuficiente. Disponível: ${equip.qtd_disponivel}, solicitado: ${qty}`,
          estoque_disponivel: equip.qtd_disponivel,
        }, { status: 409 });
      }

      qtdTotalFinal = equip.qtd_total;
      qtdDispFinal = equip.qtd_disponivel - qty;
      const novoStatus = qtdDispFinal <= 0 ? "Em Uso" : equip.status;

      const { data: updated } = await supabase
        .from("equipamentos")
        .update({
          qtd_disponivel: qtdDispFinal,
          status: novoStatus,
          funcionario: funcionario || equip.funcionario,
          departamento: departamento || equip.departamento,
        })
        .eq("id", equip.id)
        .select()
        .single();

      estoqueAtual = updated;
    }
  } else if (isEntrada) {
    // Equipamento novo: cria o registro
    const novoEquip = {
      nome: item_nome,
      categoria: categoria || "Periférico",
      marca: "—", modelo: "—",
      serial: serial || "—",
      patrimonio: patrimonio || "—",
      funcionario: "—", departamento: "—",
      status: "Disponível",
      data_compra: hoje(),
      notas: `Cadastrado via chatbot Telegram. Operador: ${operador || "n8n"}`,
      qtd_total: qty,
      qtd_disponivel: qty,
      unidade: unidadeNorm,
    };
    const { data: created } = await supabase
      .from("equipamentos")
      .insert([novoEquip])
      .select()
      .single();

    if (created) {
      equipId = created.id;
      estoqueAtual = created;
    }
  } else {
    return NextResponse.json({
      error: `Equipamento '${item_nome}' não encontrado no sistema. Registre-o primeiro como entrada.`,
    }, { status: 404 });
  }

  // Registra a movimentação
  const movimentacao = {
    data: hoje(),
    tipo: tipoNorm,
    equipamento_id: equipId || null,
    item_nome: nomeRegistro,
    serial: serialReg,
    patrimonio: patReg,
    categoria: catRegistro,
    qty,
    qtd_total: qtdTotalFinal,
    qtd_disponivel: qtdDispFinal,
    funcionario: funcionario || null,
    departamento: departamento || null,
    operador: operador || "Chatbot Telegram",
    obs: obs || null,
  };

  const { data: movData, error: movError } = await supabase
    .from("movimentacoes")
    .insert([movimentacao])
    .select()
    .single();

  if (movError) {
    return NextResponse.json({ error: "Erro ao registrar movimentação", detalhes: movError.message }, { status: 500 });
  }

  return NextResponse.json({
    sucesso: true,
    mensagem: isEntrada
      ? `✅ Entrada registrada: ${qty}x ${nomeRegistro}. Estoque disponível: ${qtdDispFinal}`
      : `✅ Saída registrada: ${qty}x ${nomeRegistro} para ${funcionario || "—"}. Estoque disponível: ${qtdDispFinal}`,
    movimentacao: movData,
    estoque: estoqueAtual ? {
      id: estoqueAtual.id,
      nome: estoqueAtual.nome,
      qtd_total: estoqueAtual.qtd_total,
      qtd_disponivel: estoqueAtual.qtd_disponivel,
      status: estoqueAtual.status,
    } : null,
  });
}

// ── GET /api/chatbot?item=nome ────────────────────────────────────────────────
// Consulta estoque — útil para o agente verificar disponibilidade
export async function GET(req) {
  if (!autenticar(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const item = searchParams.get("item");
  const supabase = getSupabaseAdmin();

  if (item) {
    const { data, error } = await supabase
      .from("equipamentos")
      .select("id, nome, categoria, qtd_total, qtd_disponivel, status, funcionario, departamento")
      .ilike("nome", `%${item}%`)
      .order("nome");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ equipamentos: data });
  }

  // Sem filtro: retorna resumo do estoque
  const { data, error } = await supabase
    .from("equipamentos")
    .select("id, nome, categoria, qtd_total, qtd_disponivel, status")
    .order("nome");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const resumo = {
    total_itens: data.length,
    total_unidades: data.reduce((s, e) => s + (e.qtd_total || 0), 0),
    disponiveis: data.reduce((s, e) => s + (e.qtd_disponivel || 0), 0),
    equipamentos: data,
  };

  return NextResponse.json(resumo);
}
