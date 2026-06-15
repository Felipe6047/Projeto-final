export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function mascaraCpf(valor: string) {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraCep(valor: string) {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
}

export function mascaraMoeda(valor: string) {
  const n = Number(apenasDigitos(valor)) / 100;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseMoeda(valor: string) {
  const d = apenasDigitos(valor);
  if (!d) return 0;
  return Number(d) / 100;
}

export function cpfValido(cpf: string) {
  const d = apenasDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(d[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(d[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(d[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(d[10]);
}

export function formatarCpfExibicao(cpf: string) {
  return mascaraCpf(cpf);
}
