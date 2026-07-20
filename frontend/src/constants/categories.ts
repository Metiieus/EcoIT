export const NODE_CATEGORIES = {
  central: { label: 'Plano Estratégico (Hub)', template: { descricao: 'Coração do ecossistema' } },
  gov: { label: 'Pilar 01 - Governança e Gestão', template: { responsavel: '', sla: '' } },
  infra: { label: 'Pilar 02 - Infraestrutura e Nuvem', template: { ip: '', uptime: '', status: 'pendente' } },
  sec: { label: 'Pilar 03 - Segurança e Compliance', template: { policy: '', lastAudit: '', secret_key: '' } },
  itil: { label: 'Pilar 04 - Serviços e Processos', template: { processo: '', ticketRef: '' } },
  data: { label: 'Pilar 05 - Dados e Inteligência', template: { dataLake: '', refreshRate: '' } },
  rh: { label: 'Pilar 06 - Pessoas e Capacitação', template: { equipe: '', certificacao: '' } },
  finops: { label: 'Pilar 07 - Financeiro e Fornecedores', template: { orcamentoMensal: 0, fornecedor: '' } },
  inovacao: { label: 'Pilar 08 - Inovação e IA', template: { projeto: '', budget: 0 } },
};
