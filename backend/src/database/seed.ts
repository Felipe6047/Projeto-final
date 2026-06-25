import "reflect-metadata";
import { DataSource } from "typeorm";
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
import { CartaoCredito } from "../entities/CartaoCredito";

async function seed(ds?: DataSource) {
  const source = ds ?? AppDataSource;
  if (!source.isInitialized) {
    await source.initialize();
  }

  const nivelRepo = source.getRepository(NivelFidelidade);
  if (await nivelRepo.count() === 0) {
    console.log("Inserindo Níveis...");
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

  }

  if (await source.getRepository(Conquista).count() === 0) {
    console.log("Inserindo Conquistas...");
    await source.getRepository(Conquista).save([
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
    {
      slug: "primeira_compra",
      nome: "Iniciante",
      descricao: "Realizou a primeira compra na loja",
      icone: "shopping_cart",
    },
    {
      slug: "fiel_escudeiro",
      nome: "Fiel Escudeiro",
      descricao: "Fez compras por 3 meses consecutivos",
      icone: "workspace_premium",
    },
    {
      slug: "negociador_nato",
      nome: "Negociador Nato",
      descricao: "Conseguiu 50 trocas no mercado",
      icone: "store",
    },
    {
      slug: "aniversario",
      nome: "Feliz Aniversário",
      descricao: "Ganhou bônus no dia do aniversário",
      icone: "cake",
    },
    {
      slug: "rei_das_trocas",
      nome: "Rei das Trocas",
      descricao: "Realizou 25 trocas de cupons com sucesso",
      icone: "swap_horiz",
    },
    {
      slug: "colecionador",
      nome: "Colecionador",
      descricao: "Possui 10 cupons diferentes ao mesmo tempo",
      icone: "collections_bookmark",
    },
    {
      slug: "bem_vindo",
      nome: "Bem-vindo!",
      descricao: "Completou o cadastro e fez o primeiro login",
      icone: "waving_hand",
    },
    {
      slug: "maratonista",
      nome: "Maratonista de Compras",
      descricao: "Registrou compras por 7 semanas seguidas",
      icone: "local_fire_department",
    },
    {
      slug: "generoso",
      nome: "Coração Generoso",
      descricao: "Deu presentes para 3 amigos diferentes",
      icone: "volunteer_activism",
    },
    {
      slug: "expert_mercado",
      nome: "Expert do Mercado",
      descricao: "Vendeu 5 cupons no mercado de trocas",
      icone: "storefront",
    },
    {
      slug: "nivel_ouro",
      nome: "Ouro Puro",
      descricao: "Alcançou o nível Ouro no programa de fidelidade",
      icone: "emoji_events",
    },
    {
      slug: "membro_vip",
      nome: "Membro VIP",
      descricao: "Acumulou mais de 10.000 pontos totais",
      icone: "diamond",
    },
  ]);

  }

  if (await source.getRepository(CupomTemplate).count() === 0) {
    console.log("Inserindo CupomTemplates...");
    await source.getRepository(CupomTemplate).save([
    {
      titulo: "20% off Eletrônicos",
      descricao: "Desconto em eletrônicos selecionados",
      categoria: "Eletrônicos",
      descontoPercentual: "20.00",
      valorMinimoCompra: "150.00",
      diasValidade: 30,
      ativo: true,
      imagemUrl: null,
      precoPontos: 500,
      limitePorUsuario: 2,
    },
    {
      titulo: "R$ 25 de cashback",
      descricao: "Abatimento na próxima compra",
      categoria: "Geral",
      descontoPercentual: null,
      valorMinimoCompra: "80.00",
      diasValidade: 45,
      ativo: true,
      imagemUrl: null,
      precoPontos: 400,
    },
    {
      titulo: "Frete grátis Nacional",
      descricao: "Válido para compras acima de R$ 99",
      categoria: "Frete",
      descontoPercentual: null,
      valorMinimoCompra: "99.00",
      diasValidade: 15,
      ativo: true,
      imagemUrl: null,
      precoPontos: 600,
    },
    {
      titulo: "10% off Moda",
      descricao: "Vestuário e acessórios",
      categoria: "Moda",
      descontoPercentual: "10.00",
      valorMinimoCompra: null,
      diasValidade: 30,
      ativo: true,
      imagemUrl: null,
      precoPontos: 300,
    },
    {
      titulo: "R$ 50 de cashback VIP",
      descricao: "Apenas para clientes selecionados",
      categoria: "Geral",
      descontoPercentual: null,
      valorMinimoCompra: "200.00",
      diasValidade: 60,
      ativo: true,
      imagemUrl: null,
      precoPontos: 1500,
      limiteTotal: 50,
    },
    {
      titulo: "15% off Games",
      descricao: "Jogos e consoles",
      categoria: "Games",
      descontoPercentual: "15.00",
      valorMinimoCompra: "300.00",
      diasValidade: 20,
      ativo: true,
      imagemUrl: null,
      precoPontos: 800,
    },
    {
      titulo: "Frete expresso grátis",
      descricao: "Entrega em até 2 dias",
      categoria: "Frete",
      descontoPercentual: null,
      valorMinimoCompra: "250.00",
      diasValidade: 10,
      ativo: true,
      imagemUrl: null,
      precoPontos: 1000,
    },
    {
      titulo: "5% off em tudo",
      descricao: "Válido para todo o site",
      categoria: "Geral",
      descontoPercentual: "5.00",
      valorMinimoCompra: null,
      diasValidade: 90,
      ativo: true,
      imagemUrl: null,
      precoPontos: 200,
    },
    {
      titulo: "Compre 1 Leve 2 (Acessórios)",
      descricao: "Válido em acessórios selecionados",
      categoria: "Acessórios",
      descontoPercentual: "50.00",
      valorMinimoCompra: "100.00",
      diasValidade: 30,
      ativo: true,
      imagemUrl: null,
      precoPontos: 750,
      limitePorUsuario: 1,
    },
    {
      titulo: "R$ 100 off Smart TVs",
      descricao: "Desconto direto na compra de TVs",
      categoria: "Eletrônicos",
      descontoPercentual: null,
      valorMinimoCompra: "1500.00",
      diasValidade: 15,
      ativo: true,
      imagemUrl: null,
      precoPontos: 2500,
      limiteTotal: 20,
    },
  }

  if (await source.getRepository(Produto).count() === 0) {
    console.log("Inserindo Produtos...");
    await source.getRepository(Produto).save([
    {
      nome: "Caneca FRIK",
      descricao: "Caneca personalizada 350ml com logo exclusivo",
      precoReais: "49.90",
      estoque: 50,
      categoria: "Acessórios",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    },
    {
      nome: "Kit Café Especial",
      descricao: "Seleção de cafés premium torrados na hora",
      precoReais: "89.90",
      estoque: 25,
      categoria: "Gastronomia",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    },
    {
      nome: "Camiseta Edição Ouro",
      descricao: "Camiseta algodão premium edição limitada",
      precoReais: "129.90",
      estoque: 15,
      categoria: "Moda",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    },
    {
      nome: "Fone Bluetooth FRIK",
      descricao: "Fone sem fio com cancelamento de ruído ativo",
      precoReais: "149.90",
      estoque: 30,
      categoria: "Eletrônicos",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    },
    {
      nome: "Smartwatch Sport",
      descricao: "Relógio inteligente com monitor cardíaco e GPS",
      precoReais: "299.90",
      estoque: 10,
      categoria: "Eletrônicos",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    },
    {
      nome: "Mochila FRIK",
      descricao: "Mochila urbana 25L impermeável com porta USB",
      precoReais: "119.90",
      estoque: 40,
      categoria: "Acessórios",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    },
    {
      nome: "Garrafa Térmica 1L",
      descricao: "Mantém frio por 24h e quente por 12h",
      precoReais: "89.00",
      estoque: 20,
      categoria: "Acessórios",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    },
    {
      nome: "Óculos de Sol Vintage",
      descricao: "Proteção UV400 com estilo retrô exclusivo",
      precoReais: "159.00",
      estoque: 25,
      categoria: "Moda",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    },
    {
      nome: "Teclado Mecânico RGB",
      descricao: "Switches azuis para digitação e jogos",
      precoReais: "249.90",
      estoque: 15,
      categoria: "Games",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
    },
    {
      nome: "Mouse Gamer Sem Fio",
      descricao: "10000 DPI com bateria de longa duração",
      precoReais: "189.90",
      estoque: 30,
      categoria: "Games",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    },
    {
      nome: "Livro: A Arte da Gamificação",
      descricao: "Guia completo sobre sistemas de engajamento",
      precoReais: "69.50",
      estoque: 50,
      categoria: "Entretenimento",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    },
    {
      nome: "Tênis Urban Runner",
      descricao: "Conforto e estilo para o dia a dia",
      precoReais: "199.90",
      estoque: 20,
      categoria: "Moda",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    },
    {
      nome: "Luminária LED Moderna",
      descricao: "Iluminação ambiente com controle de cor",
      precoReais: "79.90",
      estoque: 10,
      categoria: "Bem-estar",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    },
    {
      nome: "Kit Skincare Premium",
      descricao: "Cuidados com a pele – hidratante + sérum + protetor",
      precoReais: "149.90",
      estoque: 12,
      categoria: "Bem-estar",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop",
    },
    {
      nome: "Jogo de Tabuleiro Estratégico",
      descricao: "Para jogar com a família e amigos",
      precoReais: "220.00",
      estoque: 20,
      categoria: "Entretenimento",
      ativo: true,
      imagemUrl: "/jogo_tabuleiro.png",
    },
    {
      nome: "Vale Jantar Bistrô",
      descricao: "Voucher para jantar completo a dois",
      precoReais: "180.00",
      estoque: 5,
      categoria: "Gastronomia",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop",
    },
  ]);

  }

  if (await source.getRepository(Missao).count() === 0) {
    console.log("Inserindo Missões...");
    await source.getRepository(Missao).save([
    {
      titulo: "Primeira troca",
      descricao: "Realize sua primeira troca de cupom",
      pontosRecompensa: 100,
      metaValor: 1,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
    {
      titulo: "Presenteie alguém",
      descricao: "Envie um cupom de presente",
      pontosRecompensa: 150,
      metaValor: 1,
      tipoMeta: "presentes" as const,
      ativa: true,
    },
    {
      titulo: "Cliente Ouro",
      descricao: "Acumule 1000 pontos em compras",
      pontosRecompensa: 200,
      metaValor: 1000,
      tipoMeta: "pontos" as const,
      ativa: true,
    },
    {
      titulo: "Mestre das Trocas",
      descricao: "Realize 10 trocas de cupons",
      pontosRecompensa: 500,
      metaValor: 10,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
    {
      titulo: "Cliente Frequente",
      descricao: "Faça 5 compras em um mês",
      pontosRecompensa: 300,
      metaValor: 5,
      tipoMeta: "compras" as const,
      ativa: true,
    },
    {
      titulo: "Primeira Troca",
      descricao: "Realize sua primeira troca de cupom",
      pontosRecompensa: 100,
      metaValor: 1,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
    {
      titulo: "Comprador Assíduo",
      descricao: "Registre 10 compras na plataforma",
      pontosRecompensa: 400,
      metaValor: 10,
      tipoMeta: "compras" as const,
      ativa: true,
    },
    {
      titulo: "Grande Acumulador",
      descricao: "Acumule 3.000 pontos no total",
      pontosRecompensa: 300,
      metaValor: 3000,
      tipoMeta: "pontos" as const,
      ativa: true,
    },
    {
      titulo: "Rei da Generosidade",
      descricao: "Presenteie 3 amigos com cupons ou produtos",
      pontosRecompensa: 500,
      metaValor: 3,
      tipoMeta: "presentes" as const,
      ativa: true,
    },
    {
      titulo: "Negociante Experiente",
      descricao: "Realize 5 trocas no mercado de cupons",
      pontosRecompensa: 350,
      metaValor: 5,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
  ]);
  }

  const senhaHash =
    "$2b$10$/UGd4aICWq8pRbItFREnYufRhToMw5LydAu8O5nnO5wwxVV2sy1Ma"; // senha123

  if (await source.getRepository(Usuario).count() === 0) {
    console.log("Inserindo Usuários Demo...");
    await source.getRepository(Usuario).save([
    {
      nome: "Ana Silva",
      email: "ana@frik.demo",
      telefone: "11999990001",
      cpf: "49280983156",
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
      cpf: "94816220100",
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
      cpf: "56064850108",
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
      cpf: "66393865180",
      senhaHash,
      nivelId: 5,
      pontos: 0,
      papel: "admin",
      ativo: true,
    },
  ]);
  }

  // ---- BLOCO AVULSO (Campanhas, Eventos, Cartões) ----
  if (await source.getRepository(Campanha).count() === 0) {
    console.log("Inserindo Campanhas...");
    const inicio = new Date();
    const fimCampanha = new Date();
    fimCampanha.setDate(fimCampanha.getDate() + 30);

    await source.getRepository(Campanha).save([{
      titulo: "Boas-vindas Bronze",
      descricao: "Bônus para novos membros nível Bronze",
      segmentoJson: { nivel_slug: ["bronze"] },
      inicioEm: inicio,
      fimEm: fimCampanha,
      ativa: true,
      multiplicadorPontos: 1.5,
      descontoResgateCupons: 10,
    }]);
  }

  if (await source.getRepository(EventoSazonal).count() === 0) {
    console.log("Inserindo Eventos Sazonais...");
    const fimEvento = new Date();
    fimEvento.setDate(fimEvento.getDate() + 7);

    await source.getRepository(EventoSazonal).save([{
      titulo: "Semana do Troca-Troca",
      descricao: "+2 trocas extras para todos os níveis!",
      trocasExtras: 2,
      inicioEm: new Date(),
      fimEm: fimEvento,
      ativo: true,
    }]);
  }

  const countCartoes = await source.getRepository(CartaoCredito).count();
  if (countCartoes === 0) {
    // Verify referenced users exist before inserting cartoes
    const usuarioRepo = source.getRepository(Usuario);
    const usuariosExistentes = await usuarioRepo.find({ select: ["id"] });
    const idsExistentes = new Set(usuariosExistentes.map((u) => u.id));

    const cartaoData = [
      { usuarioId: 1, apelido: "Meu Cart\u00e3o (Mastercard)", numero: "5582951614393600", nomeTitular: "ANA SILVA", validade: "02/27", cvv: "945", principal: true },
      { usuarioId: 2, apelido: "Cart\u00e3o Visa", numero: "4539579713773567", nomeTitular: "BRUNO COSTA", validade: "06/28", cvv: "696", principal: true },
      { usuarioId: 3, apelido: "Master Principal", numero: "5290030760984091", nomeTitular: "CARLA MENDES", validade: "02/27", cvv: "112", principal: true },
      { usuarioId: 4, apelido: "Cart\u00e3o Business", numero: "5108666834191510", nomeTitular: "ADMIN FRIK", validade: "12/27", cvv: "900", principal: true },
    ].filter((c) => idsExistentes.has(c.usuarioId));

    if (cartaoData.length > 0) {
      console.log(`Inserindo ${cartaoData.length} CartaoCredito...`);
      await source.getRepository(CartaoCredito).save(cartaoData);
    } else {
      console.log("Usuários de demo não existem, pulando CartaoCredito...");
    }
  }



  console.log("Seed aplicado com sucesso.");
  // Only destroy if we initialized the connection ourselves
  if (!ds) await source.destroy();
}

export async function runSeed(ds?: DataSource) {
  await seed(ds);
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

