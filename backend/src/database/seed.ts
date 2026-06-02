import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { NivelFidelidade } from "../entities/NivelFidelidade";
import { Conquista } from "../entities/Conquista";
import { CupomTemplate } from "../entities/CupomTemplate";
import { Produto } from "../entities/Produto";
import { Missao } from "../entities/Missao";
import { Usuario } from "../entities/Usuario";
import { Campanha } from "../entities/Campanha";
import { CupomUsuario } from "../entities/CupomUsuario";
import { EventoSazonal } from "../entities/EventoSazonal";

async function seed() {
  await AppDataSource.initialize();

  const nivelRepo = AppDataSource.getRepository(NivelFidelidade);
  const countNiveis = await nivelRepo.count();
  if (countNiveis > 0) {
    console.log("Seed já aplicado — nenhuma alteração.");
    await AppDataSource.destroy();
    return;
  }

  await nivelRepo.save([
    {
      nome: "Bronze",
      slug: "bronze",
      ordem: 1,
      trocasMes: 1,
      mesmoRankApenas: true,
      podePresentearCupom: false,
      podePresentearProduto: false,
      valorMaxPresente: null,
      podeCriarSalaTroca: false,
      pontosMinimos: 0,
    },
    {
      nome: "Prata",
      slug: "prata",
      ordem: 2,
      trocasMes: 3,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: false,
      valorMaxPresente: null,
      podeCriarSalaTroca: false,
      pontosMinimos: 500,
    },
    {
      nome: "Ouro",
      slug: "ouro",
      ordem: 3,
      trocasMes: 10,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: true,
      valorMaxPresente: "100.00",
      podeCriarSalaTroca: false,
      pontosMinimos: 2000,
    },
    {
      nome: "Platina",
      slug: "platina",
      ordem: 4,
      trocasMes: null,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: true,
      valorMaxPresente: null,
      podeCriarSalaTroca: true,
      pontosMinimos: 5000,
    },
    {
      nome: "Diamante",
      slug: "diamante",
      ordem: 5,
      trocasMes: null,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: true,
      valorMaxPresente: null,
      podeCriarSalaTroca: true,
      pontosMinimos: 15000,
    },
  ]);

  await AppDataSource.getRepository(Conquista).save([
    {
      slug: "amigo_ouro",
      nome: "Amigo Ouro",
      descricao: "Deu 5 presentes para amigos",
      icone: "star",
    },
    {
      slug: "troca_justa",
      nome: "Troca Justa",
      descricao: "Concluiu 10 trocas aprovadas",
      icone: "handshake",
    },
    {
      slug: "corrente_bem",
      nome: "Corrente do Bem",
      descricao: "Presente gerou nova compra",
      icone: "link",
    },
  ]);

  const templates = await AppDataSource.getRepository(CupomTemplate).save([
    {
      titulo: "20% off Eletrônicos",
      descricao: "Desconto em eletrônicos selecionados",
      categoria: "Eletrônicos",
      descontoPercentual: "20.00",
      valorMinimoCompra: "150.00",
      diasValidade: 30,
      ativo: true,
    },
    {
      titulo: "R$ 25 de cashback",
      descricao: "Abatimento na próxima compra",
      categoria: "Geral",
      descontoPercentual: null,
      valorMinimoCompra: "80.00",
      diasValidade: 45,
      ativo: true,
    },
    {
      titulo: "Frete grátis",
      descricao: "Válido para compras acima de R$ 99",
      categoria: "Frete",
      descontoPercentual: null,
      valorMinimoCompra: "99.00",
      diasValidade: 15,
      ativo: true,
    },
  ]);

  await AppDataSource.getRepository(Produto).save([
    {
      nome: "Caneca FRIK",
      descricao: "Caneca personalizada 350ml",
      precoReais: "49.90",
      precoPontos: 500,
      estoque: 100,
      ativo: true,
    },
    {
      nome: "Kit Café Especial",
      descricao: "Seleção de cafés premium",
      precoReais: "89.90",
      precoPontos: 900,
      estoque: 50,
      ativo: true,
    },
    {
      nome: "Camiseta Edição Ouro",
      descricao: "Camiseta algodão premium",
      precoReais: "129.90",
      precoPontos: 1300,
      estoque: 30,
      ativo: true,
    },
  ]);

  await AppDataSource.getRepository(Missao).save([
    {
      titulo: "Primeira troca",
      descricao: "Realize sua primeira troca de cupom",
      pontosRecompensa: 100,
      metaValor: 1,
      tipoMeta: "trocas",
      ativa: true,
    },
    {
      titulo: "Presenteie alguém",
      descricao: "Envie um cupom de presente",
      pontosRecompensa: 150,
      metaValor: 1,
      tipoMeta: "presentes",
      ativa: true,
    },
  ]);

  const senhaHash =
    "$2b$10$/UGd4aICWq8pRbItFREnYufRhToMw5LydAu8O5nnO5wwxVV2sy1Ma"; // senha123

  const usuarios = await AppDataSource.getRepository(Usuario).save([
    {
      nome: "Ana Silva",
      email: "ana@frik.demo",
      telefone: "11999990001",
      cpf: "11111111111",
      senhaHash,
      nivelId: 3,
      pontos: 2500,
      papel: "cliente",
      ativo: true,
    },
    {
      nome: "Bruno Costa",
      email: "bruno@frik.demo",
      telefone: "11999990002",
      cpf: "22222222222",
      senhaHash,
      nivelId: 2,
      pontos: 800,
      papel: "cliente",
      ativo: true,
    },
    {
      nome: "Carla Mendes",
      email: "carla@frik.demo",
      telefone: "11999990003",
      cpf: "33333333333",
      senhaHash,
      nivelId: 1,
      pontos: 120,
      papel: "cliente",
      ativo: true,
    },
    {
      nome: "Admin FRIK",
      email: "admin@frik.demo",
      telefone: "11999990000",
      cpf: "00000000000",
      senhaHash,
      nivelId: 5,
      pontos: 0,
      papel: "admin",
      ativo: true,
    },
  ]);

  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 1);
  const fimCampanha = new Date();
  fimCampanha.setDate(fimCampanha.getDate() + 30);

  await AppDataSource.getRepository(Campanha).save({
    titulo: "Boas-vindas Bronze",
    descricao: "Bônus para novos membros nível Bronze",
    segmentoJson: { nivel_slug: ["bronze"] },
    inicioEm: inicio,
    fimEm: fimCampanha,
    ativa: true,
  });

  const validade25 = new Date();
  validade25.setDate(validade25.getDate() + 25);
  const validade40 = new Date();
  validade40.setDate(validade40.getDate() + 40);
  const validade20 = new Date();
  validade20.setDate(validade20.getDate() + 20);
  const validade10 = new Date();
  validade10.setDate(validade10.getDate() + 10);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  await AppDataSource.getRepository(CupomUsuario).save([
    {
      usuarioId: usuarios[0].id,
      templateId: templates[0].id,
      codigo: "FRIK-ANA-001",
      status: "disponivel",
      validadeAte: fmt(validade25),
      origem: "compra",
    },
    {
      usuarioId: usuarios[0].id,
      templateId: templates[1].id,
      codigo: "FRIK-ANA-002",
      status: "disponivel",
      validadeAte: fmt(validade40),
      origem: "missao",
    },
    {
      usuarioId: usuarios[1].id,
      templateId: templates[0].id,
      codigo: "FRIK-BRU-001",
      status: "oferecido_troca",
      validadeAte: fmt(validade20),
      origem: "compra",
    },
    {
      usuarioId: usuarios[2].id,
      templateId: templates[2].id,
      codigo: "FRIK-CAR-001",
      status: "disponivel",
      validadeAte: fmt(validade10),
      origem: "campanha",
    },
  ]);

  const fimEvento = new Date();
  fimEvento.setDate(fimEvento.getDate() + 7);

  await AppDataSource.getRepository(EventoSazonal).save({
    titulo: "Semana do Troca-Troca",
    descricao: "+2 trocas extras para todos os níveis!",
    trocasExtras: 2,
    inicioEm: new Date(),
    fimEm: fimEvento,
    ativo: true,
  });

  console.log("Seed aplicado com sucesso.");
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
