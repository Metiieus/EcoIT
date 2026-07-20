# Prompt de Arquitetura e Desenvolvimento: Sistema EcoIT

## 1. Core do Sistema (O "Gêmeo Digital" de TI)
O **EcoIT** é uma plataforma de gestão estratégica de TI, desenhada como um ecossistema visual interativo. O seu objetivo é centralizar a gestão de infraestrutura, governança, segurança e negócios, permitindo que o utilizador mapeie, documente e monitore todo o ambiente tecnológico.
- **Diferenciador:** Substitui listas estáticas (Jira/Trello) por um **Canvas Interativo (Node-based)** onde a relação entre ativos é visualmente explícita.
- **Segurança:** Integra um cofre criptografado (AES-256-GCM) para credenciais, tornando-o um hub operacional seguro.
- **Inteligência:** Suporta monitorização em tempo real (Pings, status) e documentação técnica (Wiki em Markdown) acoplada aos nós do inventário.

## 2. Princípios de Construção
O sistema deve ser desenvolvido seguindo estes princípios inegociáveis:
- **Modularidade:** Separação clara entre Front-end (React/React Flow) e Back-end (Express/Prisma).
- **Flexibilidade:** Uso do campo `metadata` (JSON) para evitar colunas rígidas no banco de dados e acomodar diferentes tipos de ativos.
- **Segurança nativa:** A criptografia deve ser tratada no back-end antes de qualquer persistência.
- **Progressividade:** Cada funcionalidade deve ser testada e validada antes de receber design de alto nível.

## 3. Plano de Desenvolvimento em Etapas (Roadmap)

### Etapa 1: Fundação de Dados e API Base
- **Objetivo:** Garantir que o back-end grava e lê nós flexíveis.
- **Tarefas:**
    - Finalizar schema Prisma com campo `metadata` (JSON).
    - Criar serviços CRUD (`NodeService`) e rotas Express.
    - Validar a persistência via `seed.ts`.

### Etapa 2: Integração e Visualização (React Flow)
- **Objetivo:** Renderizar os dados no Canvas.
- **Tarefas:**
    - Criar o cliente de API (`api.ts`).
    - Mapear a resposta da API para o formato `{id, position, data}` que o React Flow exige.
    - Implementar a função de `JSON.parse` nos `metadata` para tornar os campos consumíveis pelo front-end.

### Etapa 3: Gestão de Estado e Interatividade
- **Objetivo:** Tornar o mapa "vivo".
- **Tarefas:**
    - Implementar `drag-and-drop` com salvamento contínuo (`PATCH /api/nodes/:id/position`).
    - Criar o sistema de modais dinâmicos que se adaptam conforme a `category` do nó.

### Etapa 4: Camada de Segurança e Observabilidade
- **Objetivo:** Proteger e monitorar.
- **Tarefas:**
    - Implementar o Cofre de Segredos (`SecretVault`).
    - Configurar os *Workers* de background para monitoramento de ativos (Pings/Status).

### Etapa 5: Refinamento Visual e Experiência (UI/UX)
- **Objetivo:** Performance e estética.
- **Tarefas:**
    - Aplicar Design System (estética *Tech & Green*).
    - Implementar animações (Framer Motion) e drawer lateral para detalhes.

---

## 4. Instruções para o Desenvolvedor (IA)
Sempre que pedires novas implementações, segue este protocolo:
1. **Verificação de Estado:** Analisa se a Etapa anterior está 100% funcional.
2. **Consistência:** Garante que o `metadata` está a ser devidamente tratado como objeto (parse/stringify).
3. **Tipagem:** Mantém o TypeScript rigoroso.
4. **Verificação Visual:** Se a alteração envolver UI, especifica como o componente deve ser renderizado no React Flow.



# Resumo do Sistema: EcoIT
O EcoIT é uma plataforma inovadora de Gestão Executiva e Mapeamento de Ecossistemas de TI. Ele foi concebido para centralizar a visão estratégica da tecnologia de uma empresa, permitindo gerir ativos, dependências lógicas e credenciais através de uma interface visual e altamente interativa.
🎯 Objetivo Principal
Proporcionar aos gestores de TI, CTOs e administradores de redes uma visão panorâmica (helicóptero) de toda a arquitetura tecnológica, saindo das tradicionais planilhas para um formato de mapa mental interativo ("Canvas Estratégico").
🚀 Principais Funcionalidades
Canvas Executivo (Topologia Visual)
O coração do sistema é uma tela infinita (Canvas) onde todos os componentes gravitam em torno de um Plano Estratégico Central.
A topologia organiza-se automaticamente em 8 Pilares Fundamentais (ex: Infraestrutura, Governança, Segurança, Canais Digitais, etc.).
Os utilizadores podem criar, arrastar e conectar nós (ativos) aos pilares, visualizando o estado de "saúde" de cada um em tempo real (Online, Offline, Manutenção, etc.).
2. Gestão de Ativos e Metadados
Cada nó adicionado ao Canvas atua como um sistema ou ativo real. O EcoIT guarda metadados vitais de forma estruturada:
Infraestrutura: Endereços IP, tipo de hardware (Servidor, Router, Firewall), status.
Governança: Prazos, SLA, responsáveis e níveis de prioridade.
Segurança: Domínios de autenticação e criticidade (Baixa a Crítica).
Sistemas/Software: Fornecedores, custos anuais de licenciamento e tipos de aplicação.
3. Cofre Central de Segurança (Vault)
O sistema conta com um módulo robusto de cofre de senhas encriptado no backend.
Cada ativo pode ter as suas credenciais armazenadas de forma segura.
Mecanismo de "Reveal": Para ver uma senha, o sistema desencripta a informação no momento e exibe o Plaintext apenas durante 30 segundos, destruindo-a da memória do ecrã logo de seguida, garantindo alta segurança contra olhares indiscretos.
4. Mapeamento de Conexões (Dependências)
Os utilizadores podem traçar dependências manuais (linhas visuais) entre dois ativos quaisquer, construindo rapidamente uma teia lógica. Se o ativo X for abaixo, é visualmente claro que o ativo Y será impactado.
Exportação e Backup
O EcoIT permite exportar toda a topologia lógica (nós, pilares e conexões) num formato JSON limpo, facilitando backups estruturais sem comprometer a exportação de chaves criptografadas (que ficam blindadas no servidor).
🛠️ Arquitetura Técnica (Stack)
O EcoIT é uma aplicação Full-Stack moderna:
Frontend: Desenvolvido em React.js com Vite e TypeScript. A interface é construída do zero, sem bibliotecas pesadas de diagramação, com manipulação de DOM/SVG ultra-otimizada e componentes estilizados puramente via CSS.
Backend: Desenvolvido em Node.js com Express e TypeScript.
Base de Dados: Utiliza SQLite via Prisma ORM, garantindo um ambiente leve, fácil de migrar e extremamente veloz para a persistência local dos ativos e criptografia do cofre.