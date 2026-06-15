"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  adicionarAmigo,
  buscarUsuariosAmigos,
  getExtratoWallet,
  getHistoricoPontos,
  getMeusAmigos,
  getPerfil,
  getTodasConquistas,
  listarCompras,
  PerfilResponse,
  removerAmigo,
  verificarKyc,
  Endereco,
  listarMeusEnderecos,
  criarEndereco,
  atualizarEndereco,
  excluirEndereco,
  excluirConta,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { cpfValido, mascaraCpf, mascaraCep } from "@/lib/validators";
import { buscarCep } from "@/lib/viacep";

interface HistoricoItem {
  id: string;
  valor: number;
  saldo_apos: number;
  tipo: string;
  descricao: string | null;
  criado_em: string;
}

const tipoLabel: Record<string, string> = {
  compra: "Compra",
  resgate: "Resgate",
  troca_taxa: "Taxa de troca",
  missao: "Missão",
  campanha: "Campanha",
  presente: "Presente",
  ajuste_admin: "Ajuste",
};

export function PerfilPage() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [compras, setCompras] = useState<
    { id: string; valor_total: string; pontos_gerados: number; criado_em: string }[]
  >([]);
  const [extratoWallet, setExtratoWallet] = useState<
    { id: string; valor: string; tipo: string; descricao: string | null; criado_em: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [kycModal, setKycModal] = useState(false);
  const [kycEtapa, setKycEtapa] = useState(0);
  const [kycCpf, setKycCpf] = useState("");
  const [kycProcessando, setKycProcessando] = useState(false);
  const [amigos, setAmigos] = useState<
    { id: number; nome: string; nivel: string; tem_endereco: number }[]
  >([]);
  const [buscaAmigo, setBuscaAmigo] = useState("");
  const [sugAmigos, setSugAmigos] = useState<{ id: number; nome: string; email: string }[]>([]);
  const [conquistas, setConquistas] = useState<
    { slug: string; nome: string; descricao: string; icone: string; desbloqueada: number }[]
  >([]);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [modalEndereco, setModalEndereco] = useState(false);
  const [enderecoEdicao, setEnderecoEdicao] = useState<Partial<Endereco> | null>(null);
  const [processandoEndereco, setProcessandoEndereco] = useState(false);

  useEffect(() => {
    Promise.all([
      getPerfil(),
      getHistoricoPontos(),
      listarCompras(10),
      getExtratoWallet(10),
      getMeusAmigos(),
      getTodasConquistas(),
      listarMeusEnderecos(),
    ])
      .then(([p, h, c, w, a, cq, ends]) => {
        setPerfil(p);
        setHistorico(h);
        setCompras(c);
        setExtratoWallet(w);
        setAmigos(a);
        setConquistas(cq);
        setEnderecos(ends);
        if (p.cpf) setKycCpf(mascaraCpf(p.cpf));
      })
      .catch((e: ApiError) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (buscaAmigo.length < 2) {
      setSugAmigos([]);
      return;
    }
    const t = setTimeout(() => {
      buscarUsuariosAmigos(buscaAmigo).then(setSugAmigos).catch(() => setSugAmigos([]));
    }, 300);
    return () => clearTimeout(t);
  }, [buscaAmigo]);

  useEffect(() => {
    if (!enderecoEdicao?.cep) return;
    const limpo = enderecoEdicao.cep.replace(/\D/g, "");
    if (limpo.length !== 8) return;
    
    buscarCep(limpo)
      .then((data) => {
        if (data) {
          setEnderecoEdicao((prev) => prev ? {
            ...prev,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf,
          } : prev);
        } else {
          toast("CEP não encontrado", "error");
        }
      })
      .catch(() => toast("Falha ao buscar CEP", "error"));
  }, [enderecoEdicao?.cep, toast]);

  if (loading) {
    return (
      <AppShell>
        <div className="px-4 lg:px-[40px] py-20 text-on-surface-variant">
          Carregando perfil...
        </div>
      </AppShell>
    );
  }

  if (erro || !perfil) {
    return (
      <AppShell>
        <div className="px-4 lg:px-[40px] py-20">
          <p className="text-error">{erro || "Perfil não encontrado"}</p>
          <Link href="/login" className="text-primary font-bold mt-4 inline-block">
            Fazer login
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell searchPlaceholder="Buscar no perfil...">
      <div className="px-4 lg:px-[40px] pt-8 pb-24">
        <section className="mb-8 bg-card-cream rounded-2xl p-6 premium-shadow">
          <p className="frik-label text-primary mb-1">Carteira Digital</p>
          <p className="text-3xl font-bold text-primary">
            R$ {Number(perfil.saldo_wallet ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">Cashback acumulado disponível para compras</p>
        </section>

        <section className="mb-12 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-20 h-20 rounded-full border-4 border-primary-container bg-secondary-container flex items-center justify-center text-3xl font-bold text-primary">
            {perfil.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-[32px] font-semibold">{perfil.nome}</h1>
            <p className="text-on-surface-variant">{perfil.email}</p>
            <p className="mt-2 text-primary font-bold">
              {perfil.nivel} · {perfil.pontos.toLocaleString("pt-BR")} pts
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={logout}
              className="px-6 py-3 rounded-full border border-outline-variant font-semibold text-sm hover:bg-surface-container"
            >
              Sair
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Tem certeza absoluta que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.")) return;
                try {
                  await excluirConta();
                  toast("Conta excluída com sucesso", "success");
                  logout();
                } catch {
                  toast("Erro ao excluir conta", "error");
                }
              }}
              className="px-6 py-3 rounded-full text-error font-semibold text-sm hover:bg-error/10"
            >
              Excluir conta
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card-cream rounded-2xl p-6 premium-shadow">
            <p className="frik-label text-primary mb-4">Dados da conta</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">E-mail</dt>
                <dd className="font-medium text-right">{perfil.email}</dd>
              </div>
              {"telefone" in perfil && perfil.telefone && (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">Telefone</dt>
                  <dd className="font-medium">{String(perfil.telefone)}</dd>
                </div>
              )}
              {"cpf" in perfil && perfil.cpf && (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">CPF</dt>
                  <dd className="font-medium">{String(perfil.cpf)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Nível</dt>
                <dd className="font-medium capitalize">{perfil.nivel}</dd>
              </div>
            </dl>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
            <p className="frik-label text-primary mb-4">Atalhos</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/mercado-cupons"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Mercado de cupons
              </Link>
              <Link
                href="/presentes"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Enviar presentes
              </Link>
              <Link
                href="/ranking"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Ver ranking
              </Link>
              <Link
                href="/salas"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Salas de troca
              </Link>
            </div>
          </div>
        </section>

        {compras.length > 0 && (
          <section className="mb-12">
            <p className="frik-label text-primary mb-2">Compras</p>
            <h2 className="text-[28px] font-semibold mb-4">Últimas compras</h2>
            <ul className="space-y-2">
              {compras.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between p-4 bg-surface-container-high rounded-xl text-sm"
                >
                  <span>
                    R$ {Number(c.valor_total).toFixed(2)} ·{" "}
                    {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-bold text-primary">
                    +{c.pontos_gerados} pts
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Minhas Conquistas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {conquistas.map((c) => {
              const isUnlocked = Number(c.desbloqueada) > 0;
              return (
                <div 
                  key={c.slug} 
                  className={`relative p-6 rounded-2xl text-center premium-shadow transition-all duration-300 ${
                    isUnlocked 
                      ? "bg-gradient-to-br from-primary-container/40 to-primary/10 border border-primary/30 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(204,149,68,0.3)]" 
                      : "bg-surface-container-high opacity-50 grayscale hover:grayscale-0"
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                  )}
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${isUnlocked ? 'bg-primary text-on-primary shadow-inner' : 'bg-surface-variant text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: isUnlocked ? "'FILL' 1" : "'FILL' 0" }}>
                      {c.icone || (isUnlocked ? "emoji_events" : "lock")}
                    </span>
                  </div>
                  <p className={`font-bold mt-2 ${isUnlocked ? 'text-primary' : 'text-on-surface-variant'}`}>{c.nome}</p>
                  <p className="text-[10px] sm:text-xs text-on-surface-variant mt-1 leading-tight">{c.descricao}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-12 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
          <h2 className="text-2xl font-semibold mb-4">Meus Amigos</h2>
          <div className="relative mb-4">
            <input
              placeholder="Buscar usuário por nome, e-mail ou CPF..."
              value={buscaAmigo}
              onChange={(e) => setBuscaAmigo(e.target.value)}
              className="w-full bg-surface-container-high rounded-xl px-4 py-3"
            />
            {sugAmigos.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-surface-container-low border rounded-xl shadow-lg">
                {sugAmigos.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-surface-container-high text-sm"
                      onClick={async () => {
                        try {
                          await adicionarAmigo(u.id);
                          toast("Amigo adicionado!", "success");
                          setBuscaAmigo("");
                          setSugAmigos([]);
                          getMeusAmigos().then(setAmigos);
                        } catch (e) {
                          toast((e as ApiError).message, "error");
                        }
                      }}
                    >
                      {u.nome} — {u.email}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul className="space-y-2">
            {amigos.map((a) => (
              <li key={a.id} className="flex justify-between items-center p-4 bg-card-cream rounded-xl">
                <div>
                  <p className="font-bold">{a.nome}</p>
                  <p className="text-xs text-on-surface-variant">{a.nivel} {a.tem_endereco ? "✅ endereço" : "⚠️ sem endereço"}</p>
                </div>
                <button type="button" onClick={async () => { await removerAmigo(a.id); getMeusAmigos().then(setAmigos); }} className="text-xs font-bold text-error">
                  Remover
                </button>
              </li>
            ))}
            {amigos.length === 0 && <p className="text-sm text-on-surface-variant">Nenhum amigo adicionado.</p>}
          </ul>
        </section>

        <section className="mb-12 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Meus Endereços</h2>
            <button type="button" onClick={() => { setEnderecoEdicao({ principal: enderecos.length === 0 }); setModalEndereco(true); }} className="text-sm font-bold text-primary">
              + Novo Endereço
            </button>
          </div>
          <ul className="space-y-3">
            {enderecos.map((end) => (
              <li key={end.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-card-cream rounded-xl gap-4">
                <div>
                  <p className="font-bold">
                    {end.apelido || "Casa"} {end.principal ? <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Principal</span> : ""}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {end.logradouro}, {end.numero} {end.complemento ? `- ${end.complemento}` : ""}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {end.bairro}, {end.cidade} - {end.uf} | CEP: {end.cep}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => { setEnderecoEdicao(end); setModalEndereco(true); }} className="text-sm font-bold text-primary">
                    Editar
                  </button>
                  <button type="button" onClick={async () => {
                    if (!confirm("Tem certeza que deseja excluir?")) return;
                    try {
                      await excluirEndereco(end.id);
                      toast("Endereço excluído", "success");
                      listarMeusEnderecos().then(setEnderecos);
                    } catch (e) {
                      toast((e as ApiError).message, "error");
                    }
                  }} className="text-sm font-bold text-error">
                    Excluir
                  </button>
                </div>
              </li>
            ))}
            {enderecos.length === 0 && <p className="text-sm text-on-surface-variant">Nenhum endereço cadastrado.</p>}
          </ul>
        </section>

        {extratoWallet.length > 0 && (
          <section className="mb-12">
            <p className="frik-label text-primary mb-2">Carteira</p>
            <h2 className="text-[28px] font-semibold mb-4">Extrato da carteira</h2>
            <ul className="space-y-2">
              {extratoWallet.map((e) => (
                <li key={e.id} className="flex justify-between p-4 bg-surface-container-high rounded-xl text-sm">
                  <span>{e.descricao ?? e.tipo}</span>
                  <span className={`font-bold ${Number(e.valor) >= 0 ? "text-primary" : "text-error"}`}>
                    R$ {Number(e.valor).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <p className="frik-label text-primary mb-2">Extrato</p>
          <h2 className="text-[28px] font-semibold mb-6">Histórico de pontos</h2>
          {historico.length === 0 ? (
            <p className="text-on-surface-variant">
              Nenhuma movimentação registrada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-high text-left">
                  <tr>
                    <th className="px-4 py-3 font-bold">Data</th>
                    <th className="px-4 py-3 font-bold">Tipo</th>
                    <th className="px-4 py-3 font-bold">Descrição</th>
                    <th className="px-4 py-3 font-bold text-right">Valor</th>
                    <th className="px-4 py-3 font-bold text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h) => (
                    <tr
                      key={h.id}
                      className="border-t border-outline-variant/20"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(h.criado_em).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        {tipoLabel[h.tipo] ?? h.tipo}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {h.descricao ?? "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${
                          h.valor >= 0 ? "text-primary" : "text-error"
                        }`}
                      >
                        {h.valor >= 0 ? "+" : ""}
                        {h.valor}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {h.saldo_apos.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {kycModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-surface-container-low rounded-2xl p-8 max-w-md w-full premium-shadow">
            {kycEtapa === 0 && (
              <>
                <h3 className="text-xl font-semibold mb-4">Confirmar CPF</h3>
                <input
                  value={kycCpf}
                  onChange={(e) => setKycCpf(mascaraCpf(e.target.value))}
                  placeholder="999.999.999-99"
                  className="w-full bg-surface-container-high rounded-xl px-4 py-3 mb-4"
                />
                <button type="button" onClick={() => setKycEtapa(1)} className="w-full bg-primary text-on-primary py-3 rounded-full font-bold">
                  Continuar
                </button>
              </>
            )}
            {kycEtapa === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-4">Enviar documentos</h3>
                <p className="text-sm text-on-surface-variant mb-4">Simulação: envie foto do documento e selfie.</p>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center text-sm text-on-surface-variant mb-4">
                  Arraste ou clique para simular upload
                </div>
                <button type="button" onClick={() => setKycEtapa(2)} className="w-full bg-primary text-on-primary py-3 rounded-full font-bold">
                  Enviar para análise
                </button>
              </>
            )}
            {kycEtapa === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-4">Analisando...</h3>
                <div className="flex justify-center py-8">
                  <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <button
                  type="button"
                  disabled={kycProcessando}
                  onClick={async () => {
                    const cpfLimpo = kycCpf.replace(/\D/g, "");
                    if (!cpfValido(cpfLimpo)) return;
                    setKycProcessando(true);
                    await new Promise((r) => setTimeout(r, 2000));
                    try {
                      await verificarKyc();
                      setKycEtapa(3);
                      const p = await getPerfil();
                      setPerfil(p);
                    } finally {
                      setKycProcessando(false);
                    }
                  }}
                  className="w-full bg-primary text-on-primary py-3 rounded-full font-bold"
                >
                  Concluir verificação
                </button>
              </>
            )}
            {kycEtapa === 3 && (
              <>
                <h3 className="text-xl font-semibold mb-2 text-primary">Conta verificada!</h3>
                <p className="text-sm text-on-surface-variant mb-6">Sua identidade foi aprovada com sucesso.</p>
                <button type="button" onClick={() => setKycModal(false)} className="w-full bg-primary text-on-primary py-3 rounded-full font-bold">
                  Fechar
                </button>
              </>
            )}
            {kycEtapa < 3 && (
              <button type="button" onClick={() => setKycModal(false)} className="w-full mt-3 text-sm text-on-surface-variant">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {modalEndereco && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 max-w-lg w-full premium-shadow my-auto">
            <h3 className="text-xl font-semibold mb-6">{enderecoEdicao?.id ? "Editar Endereço" : "Novo Endereço"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Apelido (Ex: Casa, Trabalho)</label>
                <input
                  value={enderecoEdicao?.apelido || ""}
                  onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, apelido: e.target.value })}
                  className="w-full bg-surface-container-high rounded-xl px-4 py-2"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">CEP *</label>
                  <input
                    value={enderecoEdicao?.cep || ""}
                    onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, cep: mascaraCep(e.target.value) })}
                    maxLength={9}
                    placeholder="00000-000"
                    className="w-full bg-surface-container-high rounded-xl px-4 py-2"
                  />
                </div>
                <div className="flex-none w-24">
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">UF *</label>
                  <input
                    value={enderecoEdicao?.uf || ""}
                    onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, uf: e.target.value.toUpperCase().slice(0, 2) })}
                    maxLength={2}
                    className="w-full bg-surface-container-high rounded-xl px-4 py-2 uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Rua / Avenida *</label>
                <input
                  value={enderecoEdicao?.logradouro || ""}
                  onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, logradouro: e.target.value })}
                  className="w-full bg-surface-container-high rounded-xl px-4 py-2"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Número *</label>
                  <input
                    value={enderecoEdicao?.numero || ""}
                    onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, numero: e.target.value })}
                    className="w-full bg-surface-container-high rounded-xl px-4 py-2"
                  />
                </div>
                <div className="w-2/3">
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Complemento</label>
                  <input
                    value={enderecoEdicao?.complemento || ""}
                    onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, complemento: e.target.value })}
                    className="w-full bg-surface-container-high rounded-xl px-4 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Bairro *</label>
                  <input
                    value={enderecoEdicao?.bairro || ""}
                    onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, bairro: e.target.value })}
                    className="w-full bg-surface-container-high rounded-xl px-4 py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Cidade *</label>
                  <input
                    value={enderecoEdicao?.cidade || ""}
                    onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, cidade: e.target.value })}
                    className="w-full bg-surface-container-high rounded-xl px-4 py-2"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!enderecoEdicao?.principal}
                  onChange={(e) => setEnderecoEdicao({ ...enderecoEdicao, principal: e.target.checked })}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Tornar endereço principal</span>
              </label>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setModalEndereco(false)}
                className="flex-1 py-3 rounded-full font-bold text-sm bg-surface-container-high hover:bg-surface-container-highest"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processandoEndereco}
                onClick={async () => {
                  if (!enderecoEdicao?.cep || !enderecoEdicao?.logradouro || !enderecoEdicao?.numero || !enderecoEdicao?.bairro || !enderecoEdicao?.cidade || !enderecoEdicao?.uf) {
                    toast("Preencha todos os campos obrigatórios (*)", "error");
                    return;
                  }
                  setProcessandoEndereco(true);
                  try {
                    if (enderecoEdicao.id) {
                      await atualizarEndereco(enderecoEdicao.id, enderecoEdicao);
                      toast("Endereço atualizado!", "success");
                    } else {
                      await criarEndereco(enderecoEdicao);
                      toast("Endereço salvo!", "success");
                    }
                    setModalEndereco(false);
                    listarMeusEnderecos().then(setEnderecos);
                  } catch (e) {
                    toast((e as ApiError).message, "error");
                  } finally {
                    setProcessandoEndereco(false);
                  }
                }}
                className="flex-1 bg-primary text-on-primary py-3 rounded-full font-bold text-sm disabled:opacity-50"
              >
                {processandoEndereco ? "Salvando..." : "Salvar Endereço"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
