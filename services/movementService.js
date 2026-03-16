import { supabase } from "./supabase";
import { mapMov, mapEquip } from "@/lib/mappers";
import { hoje } from "@/lib/constants";

export async function getAllMovimentos() {
  const { data, error } = await supabase
    .from("movimentacoes")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data.map(mapMov);
}

/**
 * Processa uma movimentação (entrada ou saída) e atualiza o equipamento.
 * Retorna { novoEquip, novaMovimentacao } para atualizar o estado local.
 */
export async function processarMovimento({ tipo, itemSel, itens, nomeItem, serial, patrimonio, qty, func, depto, obs, operador }) {
  const isEntrada = tipo === "entrada";
  const itemExistente = itens.find((a) => a.id === itemSel?.id);
  let equipId = itemSel?.id;
  let qtdTotalFinal = itemExistente?.qtdTotal ?? qty;
  let qtdDispFinal = itemExistente?.qtdDisponivel ?? qty;
  let nomeRegistro = itemExistente?.nome || nomeItem || "Item desconhecido";
  let catRegistro = itemExistente?.categoria || "—";
  let serialReg = serial || itemExistente?.serial || "—";
  let patReg = patrimonio || itemExistente?.patrimonio || "—";
  let novoEquip = null;

  if (itemExistente) {
    const novas = isEntrada
      ? { qtd_total: itemExistente.qtdTotal + qty, qtd_disponivel: itemExistente.qtdDisponivel + qty, status: "Disponível", funcionario: "—", departamento: "—" }
      : {
          qtd_disponivel: itemExistente.qtdDisponivel - qty,
          funcionario: func || itemExistente.funcionario,
          departamento: depto || itemExistente.departamento,
          status: itemExistente.qtdDisponivel - qty <= 0 ? "Em Uso" : itemExistente.status,
        };
    qtdTotalFinal = novas.qtd_total ?? itemExistente.qtdTotal;
    qtdDispFinal = novas.qtd_disponivel ?? itemExistente.qtdDisponivel - qty;
    const { data } = await supabase.from("equipamentos").update(novas).eq("id", itemSel.id).select().single();
    if (data) novoEquip = mapEquip(data);
  } else if (isEntrada && nomeItem) {
    const novoP = {
      nome: nomeItem, categoria: "Periférico", marca: "—", modelo: "—",
      serial: serial || "—", patrimonio: patrimonio || "—", funcionario: "—",
      departamento: "—", status: "Disponível", data_compra: hoje(),
      notas: "Cadastrado via entrada", qtd_total: qty, qtd_disponivel: qty,
    };
    const { data } = await supabase.from("equipamentos").insert([novoP]).select().single();
    if (data) { equipId = data.id; qtdTotalFinal = qty; qtdDispFinal = qty; novoEquip = mapEquip(data); }
  }

  const movP = {
    data: hoje(), tipo, equipamento_id: equipId || null,
    item_nome: nomeRegistro, serial: serialReg, patrimonio: patReg,
    categoria: catRegistro, qty, qtd_total: qtdTotalFinal, qtd_disponivel: qtdDispFinal,
    funcionario: func || null, departamento: depto || null,
    operador, obs: obs || null,
  };
  const { data: movData } = await supabase.from("movimentacoes").insert([movP]).select().single();

  return { novoEquip, novaMovimentacao: movData ? mapMov(movData) : null };
}
