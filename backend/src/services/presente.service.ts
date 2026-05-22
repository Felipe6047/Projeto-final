import crypto from "crypto";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database";

export async function presentearCupom(data: {
  remetenteId: number;
  cupomId: number;
  canal: "email" | "whatsapp" | "sms" | "link";
  mensagem?: string;
  destinatarioEmail?: string;
  destinatarioTelefone?: string;
  destinatarioCpf?: string;
  destinatarioNome?: string;
}) {
  const [nivel] = await pool.query<RowDataPacket[]>(
    `SELECT n.pode_presentear_cupom FROM usuario u
     JOIN nivel_fidelidade n ON n.id = u.nivel_id
     WHERE u.id = :id`,
    { id: data.remetenteId }
  );
  if (!nivel[0]?.pode_presentear_cupom) {
    return { erro: "Seu nível não permite presentear cupons" };
  }

  const [cupom] = await pool.query<RowDataPacket[]>(
    `SELECT id, status FROM cupom_usuario
     WHERE id = :cupomId AND usuario_id = :remetenteId AND status = 'disponivel'`,
    { cupomId: data.cupomId, remetenteId: data.remetenteId }
  );
  if (!cupom[0]) return { erro: "Cupom indisponível para presente" };

  let destinatarioId: number | null = null;
  if (data.destinatarioCpf || data.destinatarioEmail) {
    const [dest] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM usuario
       WHERE (:cpf IS NOT NULL AND cpf = :cpf)
          OR (:email IS NOT NULL AND email = :email)
       LIMIT 1`,
      {
        cpf: data.destinatarioCpf ?? null,
        email: data.destinatarioEmail ?? null,
      }
    );
    destinatarioId = dest[0]?.id ?? null;
  }

  const codigo = crypto.randomBytes(16).toString("hex");
  const [insert] = await pool.query<ResultSetHeader>(
    `INSERT INTO presente_cupom
      (cupom_id, remetente_id, destinatario_id, destinatario_nome,
       destinatario_email, destinatario_telefone, destinatario_cpf,
       canal, mensagem, codigo_resgate)
     VALUES (:cupomId, :remetenteId, :destinatarioId, :nome,
             :email, :telefone, :cpf, :canal, :mensagem, :codigo)`,
    {
      cupomId: data.cupomId,
      remetenteId: data.remetenteId,
      destinatarioId,
      nome: data.destinatarioNome ?? null,
      email: data.destinatarioEmail ?? null,
      telefone: data.destinatarioTelefone ?? null,
      cpf: data.destinatarioCpf ?? null,
      canal: data.canal,
      mensagem: data.mensagem ?? null,
      codigo,
    }
  );

  await pool.query(
    `UPDATE cupom_usuario SET status = 'presenteado' WHERE id = :cupomId`,
    { cupomId: data.cupomId }
  );

  return {
    presenteId: insert.insertId,
    codigoResgate: codigo,
    link: `/presentes/cupom/${codigo}`,
  };
}

export async function criarPedidoPresente(data: {
  remetenteId: number;
  itens: { produtoId: number; quantidade: number }[];
  pontosUsados: number;
  valorReais: number;
  destinatario: {
    nome: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    usuarioId?: number;
  };
  endereco: Record<string, unknown>;
  mensagem?: string;
  embrulho?: boolean;
  enviarSurpresa?: boolean;
}) {
  const [nivel] = await pool.query<RowDataPacket[]>(
    `SELECT n.pode_presentear_produto, n.valor_max_presente FROM usuario u
     JOIN nivel_fidelidade n ON n.id = u.nivel_id WHERE u.id = :id`,
    { id: data.remetenteId }
  );
  const n = nivel[0];
  if (!n?.pode_presentear_produto) {
    return { erro: "Seu nível não permite presentear produtos físicos" };
  }
  if (n.valor_max_presente !== null && data.valorReais > Number(n.valor_max_presente)) {
    return { erro: `Valor máximo para presente no seu nível: R$ ${n.valor_max_presente}` };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [pedido] = await conn.query<ResultSetHeader>(
      `INSERT INTO pedido_presente
        (remetente_id, destinatario_id, destinatario_nome, destinatario_email,
         destinatario_telefone, destinatario_cpf, endereco_json, mensagem,
         embrulho, enviar_surpresa, valor_reais, pontos_usados, status)
       VALUES (:remetenteId, :destId, :nome, :email, :tel, :cpf,
               :endereco, :msg, :embrulho, :surpresa, :valor, :pontos, 'pago')`,
      {
        remetenteId: data.remetenteId,
        destId: data.destinatario.usuarioId ?? null,
        nome: data.destinatario.nome,
        email: data.destinatario.email ?? null,
        tel: data.destinatario.telefone ?? null,
        cpf: data.destinatario.cpf ?? null,
        endereco: JSON.stringify(data.endereco),
        msg: data.mensagem ?? null,
        embrulho: data.embrulho ? 1 : 0,
        surpresa: data.enviarSurpresa ? 1 : 0,
        valor: data.valorReais,
        pontos: data.pontosUsados,
      }
    );

    for (const item of data.itens) {
      const [prod] = await conn.query<RowDataPacket[]>(
        `SELECT preco_reais, preco_pontos FROM produto WHERE id = :id AND ativo = 1`,
        { id: item.produtoId }
      );
      if (!prod[0]) throw new Error("Produto inválido");
      await conn.query(
        `INSERT INTO pedido_presente_item
          (pedido_id, produto_id, quantidade, preco_unitario, pontos_unitarios)
         VALUES (:pedidoId, :produtoId, :qtd, :preco, :pontos)`,
        {
          pedidoId: pedido.insertId,
          produtoId: item.produtoId,
          qtd: item.quantidade,
          preco: prod[0].preco_reais,
          pontos: prod[0].preco_pontos,
        }
      );
    }

    if (data.pontosUsados > 0) {
      await conn.query(
        `UPDATE usuario SET pontos = pontos - :pontos WHERE id = :id`,
        { pontos: data.pontosUsados, id: data.remetenteId }
      );
    }

    await conn.commit();
    return { pedidoId: pedido.insertId, status: "pago" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function listarPedidosPresente(usuarioId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, destinatario_nome, status, valor_reais, pontos_usados,
            codigo_rastreio, criado_em, atualizado_em
     FROM pedido_presente
     WHERE remetente_id = :usuarioId OR destinatario_id = :usuarioId
     ORDER BY criado_em DESC`,
    { usuarioId }
  );
  return rows;
}
