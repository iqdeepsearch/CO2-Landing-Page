# Memorial Descritivo: Sistema Automatizado de Monitoramento de Emissões de CO₂ Industrial Baseado em Geolocalização e Código de Rastreio (V6)

**Versão:** 8.0 | **Nome comercial:** CO2·IQ Monitor | **Status:** Bloco 1 (Schema, Governança e Máquina de Estados) Formalizado em DDL — Máquina de Estados de 4 Fases, Roles de Serviço Completas e Auditoria de Exportação Consolidadas. Próxima Etapa: Sandbox/PoC de Sincronização QFieldCloud.

> **Nota de revisão (Rev 8):** Esta revisão não altera a arquitetura de dados do Bloco 1. Ela formaliza decisões de produto e de contrato de campo que já orientavam a landing e a operação, mas não estavam no memorial — e portanto o assistente da página não podia respondê-las com precisão: (i) nome comercial **CO2·IQ Monitor** (QField permanece cliente de captura, não identidade); (ii) contrato do QR Code como identificador estável, nunca como depósito de fator ou consumo; (iii) georreferência dupla — coordenada de cadastro do ativo versus coordenada da visita; (iv) ritmo operacional mensal/trimestral versus inventário anual; (v) posicionamento explícito como inventário por dado de atividade (GHG Protocol), não como CEMS de chaminé; (vi) recusa de fork do QField/QFieldCloud. Nenhum GRANT, trigger ou nome de coluna foi alterado. O nome de arquivo `CO2-QField_rev7.md` é histórico e mantido por compatibilidade com a API; o produto, nas respostas ao visitante, chama-se CO2·IQ Monitor.
>
> **Nota de revisão (Rev 7):** Esta revisão não altera a arquitetura de dados do Bloco 1. Ela formaliza, em texto, um princípio que já era verdadeiro na prática: a governança (schema, roles, máquina de estados) pertence ao banco de dados, não ao aplicativo de captura em campo. Dois ajustes cosméticos foram feitos para que a nomenclatura reflita isso — (i) a role de escrita bruta por planta deixou de levar o nome do app (`qfield_{planta_id}` → `field_ingest_{planta_id}`); (ii) a captura do nome do operador é descrita como regra de negócio do payload, não mais como uma expressão específica do QGIS/QField. Uma nova Seção 5.6 formaliza o princípio de Ingestão Desacoplada. Nenhum GRANT, trigger ou nome de coluna foi alterado.

---

## 1. Conceito do Projeto e Posicionamento Estratégico

O **CO2·IQ Monitor** (nome comercial; o memorial e artefactos internos podem ainda referir o nome histórico CO2·QField) é uma solução vertical de inteligência geoespacial e automação ambiental voltada para o setor industrial. O sistema integra a identificação física unívoca de ativos fabris via QR Code, a captura automatizada de coordenadas geográficas de alta precisão (Latitude e Longitude) **tanto do ativo quanto da visita**, o processamento analítico autônomo de taxas de emissão de dióxido de carbono (CO₂) conforme o GHG Protocol (Escopos 1 e 2) e a publicação desses dados em um painel (dashboard) web interativo dedicado por planta fabril.

A proposta central é eliminar processos manuais, planilhas isoladas e a demora no ciclo de inventários ambientais, transformando inspeções de campo **rotineiras** (em geral mensais ou trimestrais, no ritmo já existente de combustível, fator SIN e licença) em um fluxo contínuo de dados estruturados para tomada de decisão, eficiência operacional e auditoria de conformidade. O inventário anual é a soma dessas visitas — não uma campanha na véspera da auditoria.

QField e QFieldCloud são o **cliente de campo e a sincronização atuais**, escolhidos por serem open-source, falarem com QGIS e já serem aceitos em coleta ambiental. Não são o nome do produto, não são a fonte da verdade (esta é o PostgreSQL/PostGIS do CO2·IQ Monitor) e não serão forkados na V1.

---

## 2. Perfil de Cliente Ideal (ICP) e Modelo de Mercado

A solução é calibrada especificamente para atender a lacuna entre ferramentas de coleta genéricas e softwares enterprise de alto custo:

* **Público-Alvo Primário (Usuário Final):** Indústrias de Médio Porte (ex.: cerâmicas, alimentícias, metalúrgicas, cimenteiras regionais e frigoríficos) que necessitam de conformidade ambiental rigorosa, mas não possuem equipes internas de desenvolvimento de software ou analistas de GIS dedicados.
* **Canal Estratégico de Entrada (Multiplicador B2B2B):** Consultorias Ambientais especializadas em inventários de emissões e licenciamento. As consultorias utilizam o pipeline para acelerar suas operações de campo e entregam o dashboard web como produto de alto valor agregado para suas indústrias clientes.
* **Modelo de Instância:** Arquitetura Single-Tenant por planta fabril, com isolamento garantido no nível de banco de dados por meio de **schema PostgreSQL dedicado e role de serviço exclusiva por planta** (ver Seção 5.5), e não por Row Level Security lógico sobre um schema compartilhado. Cada unidade produtiva opera com governança e parametrização individual, com dados de fatores de emissão (`fatores_emissao`) centralizados em um schema compartilhado somente-leitura (`core`).

---

## 3. Justificativa de Negócio e Impacto Econômico ($)

O valor agregado do produto é fundamentado na economia direta de horas técnicas, mitigação de riscos regulatórios e eficiência térmica/operacional:

| Pilar de Retorno (ROI) | Gargalo Sem a Solução vs. Ganho com o Sistema | Impacto Financeiro Estimado |
| :--- | :--- | :--- |
| **Mão de Obra Técnica** | Eliminação de 15 a 20 horas mensais gastas por analistas na transcrição de planilhas, limpeza de dados e elaboração manual de relatórios. | Economia de **R$ 12.000 a R$ 18.000 / ano** por planta fabril. |
| **Eficiência de Queima e Combustível** | Identificação imediata de queima incompleta e caldeiras/fornos desregulados via alertas no dashboard, em vez de diagnóstico semanas após a inspeção. | Economia de **R$ 20.000 a R$ 60.000 / ano** em desperdício de combustível. |
| **Mitigação de Multas e Compliance** | Rastreabilidade jurídica (coordenadas GPS, carimbo temporal nativo e QR Code físico), evitando autuações por inconsistência ou atrasos em relatórios para órgãos ambientais. | Mitigação de autuações que variam de **R$ 10.000 a mais de R$ 100.000**. |
| **Custo de Desenvolvimento Evitado** | Acesso a uma esteira turnkey completa sem a necessidade de alocar engenheiros de software, especialistas GIS e designers de dashboard. | Economia única de **R$ 30.000 a R$ 50.000** em desenvolvimento sob medida. |

---

## 4. Mapeamento de Dores (Pain Points) Resolvidas

* **Eliminação de processos manuais e isolados:** Substituição definitiva de anotações em pranchetas de papel e planilhas desconectadas por um banco de dados centralizado.
* **Demora na identificação de desvios operacionais:** Redução do tempo de detecção de anomalias de semanas para visualização em tempo real pós-sincronização.
* **Lentidão no preenchimento em campo:** Automação total de preenchimento de cadastros e geolocalização com leitura ótica de QR Code e GPS do aparelho móvel.
* **Operação em áreas sem conectividade (Offline-First):** Garantia de continuidade do trabalho de campo no chão de fábrica ou áreas remotas com armazenamento local (GeoPackage) e sincronização resiliente.
* **Falta de precisão e rastreabilidade nos inventários:** Imutabilidade dos registros de campo, comprovando presença física no ativo e horário exato da vistoria.
* **Ausência de transparência no reporte ambiental:** Disponibilização instantânea de indicadores claros e acessíveis para auditorias externas e liderança da planta.
* **Falta de visibilidade centralizada:** Consolidação de todos os pontos de emissão da fábrica em uma interface única com mapas interativos e gráficos analíticos.

---

## 5. Metodologias Normativas, Fatores de Emissão e Formulação de Cálculo

Para assegurar rigor técnico, auditabilidade e total conformidade regulatória com órgãos ambientais e auditorias externas, o sistema é estruturado sobre padrões internacionais e nacionais consolidados:

### 5.1 Enquadramento Metodológico e Protocolos Normativos
* **GHG Protocol Corporate Standard (Escopos 1 e 2):** Estruturação do inventário corporativo e operacional com categorização clara das emissões diretas (Escopo 1 — combustão estacionária em caldeiras, fornos, secadores e geradores) e indiretas por consumo energético (Escopo 2 — eletricidade adquirida da rede).
* **ABNT NBR ISO 14064-1:** Especificação e diretrizes para quantificação e elaboração de relatórios de emissões de gases de efeito estufa.
* **Diretrizes do IPCC (Intergovernmental Panel on Climate Change):** Parâmetros de balanço de massa, oxidação e valores padrão de poder calorífico e teor de carbono para combustíveis industriais.
* **Fatores do SIN (Sistema Interligado Nacional - MCTI):** Atualização periódica dos fatores médios e marginais de emissão de CO₂ decorrentes do despacho elétrico da matriz brasileira, calculados mensalmente pelo Ministério da Ciência, Tecnologia e Inovações (MCTI).

### 5.2 Obtenção e Governança dos Fatores de Conversão e Emissão
Os fatores são centralizados e versionados em tabelas de referência do banco de dados relacional (`core.fatores_emissao`), atualizados automaticamente ou via rotinas de curadoria técnica:
1. **Combustão Estacionária (Escopo 1):** Fatores tabelados pelo Programa Brasileiro GHG Protocol e IPCC (ex.: kg CO₂/m³ de gás natural; kg CO₂/kg de GLP; kg CO₂/ton de biomassa/cavaco; kg CO₂/litro de óleo BPF ou diesel). A fórmula incorpora o Poder Calorífico Inferior (PCI) e a fração de carbono oxidada.
2. **Consumo de Eletricidade (Escopo 2):** Fator oficial do SIN publicado pelo MCTI expresso em $t\text{CO}_2/\text{MWh}$ (ou $kg\text{CO}_2/\text{kWh}$), aplicando a média mensal correspondente à competência da medição.
3. **Equivalência em CO₂e (Gases Adicionais):** Aplicação do Potencial de Aquecimento Global (*Global Warming Potential* - GWP) do IPCC (AR5/AR6) para conversão de $\text{CH}_4$ ($\text{GWP} \approx 28$) e $\text{N}_2\text{O}$ ($\text{GWP} \approx 265$) quando aplicável à tipologia do queimador/combustível.
4. **Resolução dinâmica de vigência:** A tabela `core.fatores_emissao` é estritamente *append-only* — nenhuma linha sofre `UPDATE`, nem mesmo para fechar a janela de validade de um fator superado. O fator aplicável a uma coleta é resolvido em tempo de cálculo pela query `WHERE categoria_ativo = X AND combustivel_fonte = Y AND escopo = Z AND vigencia_inicio <= timestamp_coleta ORDER BY vigencia_inicio DESC LIMIT 1`, e não pela leitura de `vigencia_fim`. Este é o contrato formal de busca de fator para o motor de cálculo (Bloco 4).

### 5.3 Modelagem Matemática e Fluxo de Cálculo no Motor Python
O motor de backend (`Python/Pandas/SQLAlchemy`) executa o processamento em lote e por evento aplicando as seguintes equações fundamentais:

#### A) Emissões Diretas por Combustão Estacionária (Escopo 1):
$$E_{\text{CO}_2, i} = C_i \times PCI_i \times FE_{\text{C}, i} \times FO_i \times \left(\frac{44}{12}\right)$$
*Onde:*
* $E_{\text{CO}_2, i}$: Emissão de $\text{CO}_2$ do ativo ou combustível $i$ (kg ou ton).
* $C_i$: Consumo medido no ativo em campo (ex.: $\text{m}^3$, $\text{kg}$, $\text{L}$ ou ton).
* $PCI_i$: Poder Calorífico Inferior do combustível ($\text{TJ}/\text{unidade}$ ou $\text{kcal}/\text{kg}$).
* $FE_{\text{C}, i}$: Fator de emissão de carbono por unidade de energia ($\text{tC}/\text{TJ}$).
* $FO_i$: Fator de oxidação da combustão (adotado como $1{,}0$ ou fração correspondente à eficiência da queima).
* $\frac{44}{12}$: Razão estequiométrica da massa molecular do $\text{CO}_2$ em relação ao Carbono ($\text{C}$).

*Forma Direta por Fator de Atividade:*
$$E_{\text{CO}_2, i} = C_i \times FE_{\text{oficial}, i}$$

#### B) Emissões Indiretas por Eletricidade - Rede SIN (Escopo 2):
$$E_{\text{CO}_2, \text{energia}} = Consumo_{\text{kWh}} \times FE_{\text{SIN, mês}} \quad [kg\text{CO}_2]$$

#### C) Totalização por Planta e Intensidade Específica:
$$E_{\text{Total Planta}} = \sum_{i=1}^{n} E_{\text{Escopo 1}, i} + \sum_{j=1}^{m} E_{\text{Escopo 2}, j}$$
$$I_{\text{Carbono}} = \frac{E_{\text{Total Planta}}}{Volume_{\text{Produção}}} \quad [kg\text{CO}_2/\text{unidade produzida}]$$

### 5.4 Governança de Dados, Auditoria e Controle de Acesso

Para que a rastreabilidade jurídica prometida ao mercado (Seção 4) seja tecnicamente sustentável em auditorias externas (ISO 14064, órgãos ambientais), o sistema formaliza os seguintes requisitos não-funcionais de governança, já implementados em DDL no Bloco 1:

* **Versionamento imutável dos fatores de emissão:** A tabela `core.fatores_emissao` nunca sofre `UPDATE` ou `DELETE` — nem sobre o valor do fator, nem sobre sua janela de vigência (ver Seção 5.2, item 4). Toda alteração gera uma nova linha com `vigencia_inicio` e `fonte` (ex.: nota técnica do MCTI, tabela do IPCC/GHG Protocol). Cada cálculo histórico permanece vinculado ao fator que estava vigente na data da medição, mesmo após atualizações posteriores.
* **Papel de curador para inserção de fatores:** A role `emission_factor_admin` possui exclusivamente `SELECT, INSERT` em `core.fatores_emissao` — sem `UPDATE`/`DELETE`, tornando o histórico normativo estruturalmente imutável. Cada inserção registra `aprovado_por` e `data_aprovacao`, estabelecendo responsabilidade nominal sobre a origem do dado.
* **Log de auditoria append-only nos dados de campo, enforçado por permissão de banco:** As roles de serviço por planta (`field_ingest_{planta_id}`) recebem apenas `SELECT, INSERT` sobre `coletas_campo` — nenhum `UPDATE`/`DELETE` é concedido, tornando a imutabilidade uma garantia estrutural do banco, e não apenas uma convenção documentada. Correções a registros existentes geram um novo registro vinculado ao original por meio de `corrige_registro_id`, preservando o histórico completo de alterações.
* **Máquina de estados de 4 fases, enforçada por trigger de banco:** Cada coleta transita por `rascunho` → `calculado` → `validado` → `exportado`, através da função centralizada `core.valida_transicao_coleta()` (acionada por trigger `BEFORE UPDATE` em cada `planta_*.coletas_campo`). A função impõe, no nível de banco — não apenas na aplicação: (i) transições estritamente sequenciais, sem saltos de etapa; (ii) apenas `calc_engine` pode mover `rascunho → calculado`, e apenas mediante `emissao_co2_kg`/`fator_emissao_id` preenchidos; (iii) `calc_engine` é explicitamente barrada de mover `calculado → validado` ou `validado → exportado`; (iv) a validação exige `validado_por` preenchido, e a exportação exige `exportado_por` preenchido, com timestamps automáticos (`data_validacao`, `data_exportacao`); (v) um registro em status `exportado` é absolutamente imutável — nenhuma coluna pode mais ser alterada, mesmo por roles com privilégio de `UPDATE`.
* **Rastreabilidade integral do cálculo:** Cada emissão calculada armazena não apenas o resultado, mas todos os insumos utilizados: `fator_emissao_id` (referência à versão específica do fator), `consumo_medido`, `timestamp_coleta`, `operador_id` e coordenadas geográficas — permitindo a reconstrução completa de qualquer cálculo a partir da origem.
* **Rastreabilidade nominal do operador de campo:** Regra de negócio, independente do cliente de campo: todo registro de `coletas_campo` deve chegar com o nome do operador já preenchido no payload, antes da sincronização — dispensando autenticação individual no PostgreSQL, que não é necessária dado que a role de conexão já é exclusiva por planta. No cliente atual (QField), essa regra é implementada via widget desabilitado com expressão `coalesce(@qfield_username, @user_full_name)`; qualquer outro cliente de campo que venha a substituí-lo deve apenas preencher o mesmo campo no payload (ver Seção 5.6).
* **Separação entre coleta, cálculo, validação e exportação, enforçada por três roles distintas:**
  * `field_ingest_{planta_id}` — escrita bruta (`SELECT, INSERT`) sobre `coletas_campo` da sua planta; sem qualquer acesso de `UPDATE`.
  * `calc_engine` — role global, `SELECT` sobre todos os schemas `planta_*`; `UPDATE` restrito às colunas `fator_emissao_id`, `emissao_co2_kg`, `status` e `calculado_em`, com a transição de `status` limitada a `rascunho → calculado` pelo trigger.
  * `gestor_auditor` — role global, `SELECT` sobre todos os schemas `planta_*`; `UPDATE` restrito às colunas `status`, `validado_por`, `data_validacao`, `exportado_por` e `data_exportacao`, cobrindo as duas transições finais da máquina de estados.
* **Tratamento de exceções de sincronização:** Deltas de campo rejeitados por violação de constraint de banco (ex.: `consumo_medido < 0`) são roteados pelo QFieldCloud para uma fila de status `Rejected/Error` visível no painel web, sem travar o banco nem descartar o log de origem. Um robô de monitoramento (ver Seção 5.5) varre essa fila periodicamente para alertar o gestor da planta.
* **Base para trilha de auditoria automatizada:** O esquema de dados da V1 já é desenhado para suportar a exportação de trilha de auditoria prevista no roadmap (Seção 9), evitando retrabalho estrutural quando esse módulo for implementado.

### 5.5 Arquitetura de Sincronização e Isolamento (Decisão Consolidada)

Esta seção formaliza a decisão arquitetural que resolve o risco de "ETL intermediário" identificado na revisão técnica do projeto, define o modelo de isolamento Single-Tenant adotado na V1, e documenta o estado de implementação do Bloco 1.

* **Sincronização direta, sem ETL customizado:** O QFieldCloud opera em modo *Offline Editing* — empacota GeoPackage para o cliente móvel, permite edição desconectada, e aplica os deltas resultantes diretamente no PostgreSQL/PostGIS de produção (Supabase ou provedor gerenciado equivalente) via connection string cadastrada nos Secrets do projeto, sem scripts intermediários de cópia (cron, webhooks) mantidos pela equipe. O banco relacional é a única fonte da verdade (*single source of truth*).
* **Topologia de isolamento — Schema dedicado por planta, mesma instância:** Cada planta fabril recebe um schema PostgreSQL próprio (ex.: `planta_alpha`, `planta_beta`), contendo suas tabelas `ativos_fabris` e `coletas_campo`. Os fatores de emissão residem em um schema compartilhado somente-leitura (`core.fatores_emissao`), eliminando replicação de dados normativos entre plantas.
* **Isolamento garantido por permissão de banco, não por convenção de aplicação:** Cada planta possui uma role de conexão PostgreSQL exclusiva (`field_ingest_{planta_id}`), hoje usada pelo QFieldCloud, com `search_path` fixado ao seu próprio schema mais `core`, e GRANTs restritos apenas às tabelas e operações necessárias. Isso substitui a dependência de Row Level Security do Supabase Auth, que não se aplica a conexões diretas via protocolo PostgreSQL com usuário de serviço (sem trânsito de JWT de usuário final).
* **Motivo da não adoção de Multi-Tenancy lógico compartilhado na V1:** Aplicar RLS baseado em `tenant_id` sobre um schema único, na camada de sincronização em lote do QFieldCloud, exigiria uma API intermediária customizada para propagar contexto de tenant por conexão — o que reintroduziria complexidade e prazo incompatíveis com o escopo da V1. O isolamento físico por schema/role entrega a mesma garantia de segurança com menor superfície de risco para o MVP.
* **Mitigação de exaustão de conexões:** Connection string parametrizada para compatibilidade dupla — porta 6543 com `?pgbouncer=true` (Transaction Pooler) ou porta 5432 com session pooling — dado que o QFieldCloud opera com conexões transacionais curtas por delta.
* **Bloqueio de exposição via PostgREST:** Os schemas `core` e `planta_*` ficam formalmente excluídos da lista de *Exposed Schemas* nas configurações da API do Supabase, impedindo que o isolamento por role de conexão direta seja contornado por um endpoint HTTP público. Esta configuração faz parte obrigatória do runbook de onboarding (abaixo) e é revalidada continuamente pelo robô de monitoramento.
* **Gestão de credenciais:** Toda role de serviço (`field_ingest_{planta_id}`, `calc_engine`, `gestor_auditor`, `emission_factor_admin`) é provisionada com senha gerada e injetada via variável de sessão do `psql` (sintaxe `PASSWORD :'variavel'`) a partir de um gerenciador de segredos — nunca como literal em texto puro em scripts versionados.
* **Robô de monitoramento contínuo:** Rotina agendada (ex.: GitHub Actions, intervalo horário) que (i) verifica deltas em status `Rejected/Error` no QFieldCloud e notifica o gestor da planta, e (ii) confirma que `core`/`planta_*` permanecem fora da lista de *Exposed Schemas* do Supabase, alertando em caso de drift de configuração.
* **Runbook de onboarding de nova planta:** Criação do schema dedicado; criação da role `field_ingest_{planta_id}` com GRANTs padronizados e `ALTER DEFAULT PRIVILEGES` cobrindo tabelas futuras do schema (privilégio de tabela inteira — `calc_engine` e `gestor_auditor` usam GRANTs coluna-específicos, que não são suportados por `ALTER DEFAULT PRIVILEGES` e por isso exigem concessão manual a cada tabela nova); criação do trigger `BEFORE UPDATE` apontando para a função centralizada `core.valida_transicao_coleta()`; configuração de credenciais no gerenciador de segredos; exclusão do novo schema da lista de *Exposed Schemas*; publicação do projeto `.qgs` correspondente no QFieldCloud.

### 5.6 Princípio de Ingestão Desacoplada (Agnosticismo de Cliente de Campo)

Esta seção formaliza uma decisão de arquitetura que já era verdadeira na prática, mas não estava explícita: **a governança de dados (Seção 5.4) reside inteiramente no banco de dados, não no aplicativo que captura o dado em campo.**

* **Contrato de payload, não contrato de app:** O schema `planta_*.coletas_campo` e as roles de serviço (Seção 5.5) esperam apenas um payload relacional/espacial padrão — identificador do ativo (via QR Code), consumo medido, latitude/longitude, timestamp e nome do operador. Nenhuma coluna, constraint ou trigger do Bloco 1 depende de uma característica proprietária do QField/QFieldCloud.
* **QField é o cliente de campo atual, não um requisito arquitetural:** A escolha do QField/QFieldCloud (Seção 7) resolve, hoje, dois problemas genuinamente caros de reconstruir do zero — sincronização offline com resolução de conflitos, e alteração de formulário em campo sem novo ciclo de publicação em loja de aplicativos. Essa escolha é reavaliável sem impacto na Seção 5.4.
* **Caminho de substituição preservado:** Caso o QField/QFieldCloud se torne um gargalo técnico ou um risco comercial (descontinuidade, mudança de licenciamento, aquisição por terceiros), um cliente de captura alternativo (ex.: app minimalista de QR Code + GPS, nativo ou PWA) pode ser conectado à mesma role `field_ingest_{planta_id}` e à mesma tabela `coletas_campo`, sem alterar o motor de cálculo (Python), o Dashboard Web, ou qualquer GRANT/trigger do Bloco 1.
* **Portabilidade de dados como mitigação adicional de risco:** Por operar sobre formatos abertos (PostgreSQL/PostGIS, e GeoPackage no armazenamento local do cliente móvel), os dados coletados permanecem acessíveis e portáveis para qualquer outra ferramenta GIS de mercado, independentemente da continuidade comercial do QFieldCloud especificamente.
* **Sem fork na V1:** QField e QFieldCloud não serão forkados. A vantagem de usar um cliente GIS já aceito no mercado (QGIS no escritório da consultoria, QField no celular do analista) perde-se se a equipe herdar a manutenção de um GIS móvel completo. A mitigação de dependência é o contrato de payload (esta seção e as Seções 5.7–5.8), não uma cópia do código de terceiro.

### 5.7 Contrato do QR Code (identidade, não cálculo)

O QR físico parafusado no ativo é um **identificador estável**. Ele não carrega o cálculo de CO₂, o fator de emissão nem o consumo da visita. Se esses valores fossem gravados na plaqueta, ela se tornaria uma planilha obsoleta no dia em que o fator SIN mudasse ou o equipamento trocasse de combustível.

O sistema opera em três camadas. Só a primeira vai no QR.

**Camada 1 — Gravado no QR (estável):**
* Prefixo do produto (`CO2IQ`), para não colidir com QR de manutenção, estoque ou EPI.
* Identificador da planta.
* Identificador interno estável do ativo (chave de `ativos_fabris`).
* TAG operacional já usado no chão de fábrica (ex.: `CAL-01`, `P-3472B`).

Formato de referência (texto, não URL longa, não PDF): `CO2IQ|<planta_id>|<ativo_id>|<TAG>`.

Na plaqueta, **ao lado** do QR, em texto legível sem aparelho: TAG, tipo do equipamento e unidade. Código que só a máquina lê não transmite confiança em campo.

**Camada 2 — Cadastro `ativos_fabris` (buscado após o scan; muda sem trocar a plaqueta):**
* Tipo do ativo (caldeira, forno, gerador, medidor, bomba, etc.).
* Escopo (1 = combustão estacionária; 2 = eletricidade da rede).
* Combustível / fonte.
* Unidade esperada da leitura (m³, L, kg, t, kWh).
* Coordenada de referência do ativo no layout da planta.
* Status (ativo / desativado).

QR desconhecido — prefixo inválido ou ativo inexistente no cadastro daquela planta — é rejeitado. O sistema não inventa equipamento.

**Camada 3 — Gerada na visita (`coletas_campo`; não está no QR):**
* Consumo / leitura do período — único número que o operador confirma ou digita; é o \(C_i\) da equação da Seção 5.3.
* Latitude e longitude da visita (GPS do aparelho).
* Timestamp.
* Nome do operador (regra de payload, Seção 5.4).

O motor Python aplica o fator vigente na data da coleta (Seção 5.2). GPS e nome **não entram na conta de tCO₂e**; entram no crédito do número (evidência de presença e rastro nominado).

**O que nunca vai no QR:** fator IPCC ou SIN, resultado em tCO₂e, consumo do mês, nome do operador, coordenada da visita.

### 5.8 Georreferência dupla (ativo × visita)

Existem duas coordenadas, com papéis distintos:

| Ponto | Onde vive | Papel |
| :--- | :--- | :--- |
| **Ativo** | Cadastro `ativos_fabris` | Onde o equipamento/plaqueta está no pátio; alimenta o mapa da planta. |
| **Visita** | Cada linha de `coletas_campo` | Onde o celular estava no momento do scan; prova de presença física. |

A vantagem de confiança é o **cruzamento**. Se a coordenada da visita distar além de um raio configurável da coordenada de cadastro do ativo, a coleta não segue silenciosa para o inventário: entra em fila de atenção (mesmo espírito da fila `Rejected/Error` da Seção 5.5). Isso mitiga o caso “scan da foto da plaqueta no escritório”.

O georreferenciamento é nativo da esteira GIS (QGIS → QField → PostGIS → dashboard Leaflet). Essa é uma vantagem de canal para consultorias que já operam em QGIS; na identidade do produto, o que se afirma ao gestor é o efeito — cada ativo é um ponto, cada visita também — não a marca do aplicativo de captura.

### 5.9 Ritmo operacional da coleta

A V1 **não** impõe um único calendário legal de “escanear QR todo mês”. Ela acompanha o ciclo em que o dado de atividade **já nasce** na planta:

* O fator de energia do SIN (Escopo 2) é publicado **mensalmente** pelo MCTI; kWh × fator de agosto não é o de março.
* Consumo de combustível de caldeira, forno e gerador a planta já fecha, em regra, **todo mês** (compra, tanque, totalizador).
* Condicionantes de licença ambiental estadual costumam pedir auto-monitoramento **mensal ou trimestral**.
* O inventário GHG corporativo (Programa Brasileiro GHG Protocol / ISO 14064-1) é em geral **anual** — e é a **soma** desses fechamentos. Mês lançado no ativo errado não se conserta na véspera da auditoria.

A leitura por QR reforça-se com a frequência: dezenas de ativos × doze meses é o volume em que “a caldeira do fundo” vira erro sistemático. O sistema admite ritmo trimestral para ativo menor ou campanha da consultoria. O contrato é o mesmo em qualquer visita: TAG certo + consumo + hora + pessoa + coordenada.

---

## 6. Estrutura de Etapas da Esteira de Dados

O ciclo operacional é regido por uma arquitetura integrada de ponta a ponta:

1. **Etapa 1 - Design e Modelagem Inicial (QGIS):** Modelagem das entidades espaciais, regras de validação nos formulários e configuração de expressões visuais para cálculo preliminar instantâneo em campo (sem gravação de estimativas no banco oficial).
2. **Etapa 2 - Coleta Móvel em Campo (QField, cliente atual — ver Seção 5.6):** O operador escaneia o QR Code do ativo, o aplicativo captura automaticamente a posição geográfica, o timestamp e a identificação nominal do operador (regra de payload — ver Seção 5.4), exibe a estimativa preliminar e armazena os dados brutos de forma segura localmente. Um atalho dedicado permite a abertura do Dashboard Web pelo navegador.
3. **Etapa 3 - Sincronização Direta em Nuvem (QFieldCloud → PostgreSQL/PostGIS):** Empacotamento offline e aplicação de deltas diretamente no schema dedicado da planta (status inicial `rascunho`), sem esteira de ETL intermediária, usando a role de serviço exclusiva da planta (ver Seção 5.5). Deltas rejeitados por constraint entram em fila de auditoria (`Rejected/Error`) sem bloquear o restante da sincronização.
4. **Etapa 4 - Motor de Cálculo e Tratamento de Dados (Python):** A role `calc_engine` resolve o fator de emissão vigente por `categoria_ativo`/`combustivel_fonte`/`escopo`/`vigencia_inicio` (Seção 5.2, item 4), executa a fórmula oficial de cálculo de emissões e transiciona o registro de `rascunho` para `calculado`, escrevendo o resultado apenas nas colunas de cálculo de `coletas_campo`.
5. **Etapa 5 - Validação e Exportação (Gestor/Auditor):** A role `gestor_auditor` revisa o período calculado e transiciona os registros para `validado` e, no fechamento oficial, para `exportado` — ponto a partir do qual o registro se torna absolutamente imutável.
6. **Etapa 6 - Visualização e Alertas (Dashboard Web Leaflet):** Interface moderna que exibe mapas de calor, clusters de pontos de emissão, gráficos temporais e notificações imediatas caso um ativo ultrapasse o limiar crítico de emissão configurado.

---

## 7. Stack Tecnológica

| Camada Arquitetural | Tecnologias Empregadas |
| :--- | :--- |
| **Design e Formulários** | QGIS (Desktop GIS para estruturação dos atributos, validações e layout de formulários). |
| **Coleta de Campo** | QField (Aplicativo móvel open-source compatível com Android/iOS, GPS integrado e leitor de QR Code). |
| **Armazenamento e Cloud** | QFieldCloud em modo *Offline Editing* conectado diretamente a PostgreSQL/PostGIS (Supabase), com isolamento por schema dedicado e role de serviço por planta, schema `core` compartilhado somente-leitura para fatores de emissão, e schemas sensíveis excluídos da API PostgREST. |
| **Motor Analítico / Backend** | Python (Pandas, GeoPandas, NumPy, SQLAlchemy, rotinas de auditoria de dados e equações do GHG Protocol/SIN), executado sob role de serviço dedicada (`calc_engine`) com escrita restrita às colunas de resultado e imposição de máquina de estados via trigger de banco. |
| **Frontend e Painel Gerencial** | HTML5, CSS3, JavaScript modular e Leaflet.js (mapas interativos, gráficos dinâmicos e balanço por escopo). |

---

## 8. Limites de Escopo do MVP (O Que Não Está na V1)

Para assegurar agilidade de entrega, estabilidade e conformidade com o framework REVERSA, os seguintes itens estão formalmente excluídos do escopo inicial da Versão 1.0:

* **Sem telemetria IoT contínua cabeada e sem CEMS de chaminé:** A coleta é realizada exclusivamente por rotinas de inspeção com operadores humanos equipados com dispositivos móveis. A V1 é **inventário por dado de atividade** (consumo × fator oficial, Seção 5.3), não monitoramento contínuo de gases na chaminé. Não substitui analisador legal, condicionante específica de órgão ambiental nem o julgamento do responsável técnico (por isso existe a etapa de validação).
* **Sem Multi-Tenancy lógico compartilhado (RLS sobre schema único):** A V1 adota isolamento Single-Tenant físico por schema PostgreSQL dedicado e role de serviço exclusiva por planta (Seção 5.5), em vez de um modelo de banco compartilhado com Row Level Security por `tenant_id`. Essa é uma decisão deliberada de escopo e viabilidade técnica para o MVP — não uma lacuna de segurança pendente.
* **Sem marketplace de compra e venda de créditos de carbono:** O foco exclusivo da V1 é a mensuração, integridade e conformidade de inventário.
* **Sem aplicativo móvel próprio e sem fork de QField/QFieldCloud:** A captura em campo na V1 usa o cliente GIS móvel já existente (Seção 5.6). A mitigação de dependência de terceiro é o contrato de payload no banco do CO2·IQ Monitor, não a duplicação do código do cliente.

---

## 9. Roadmap Estratégico de Potenciais Upgrades

| Módulo / Upgrade Futuro | Descrição Técnica | Horizonte |
| :--- | :--- | :--- |
| **Gases GEE Ampliados (CO₂e)** | Inclusão de fatores de equivalência para Metano (CH₄) e Óxido Nitroso (N₂O) no motor Python baseados em GWP (IPCC AR6). | Versão 3.5 (Curto Prazo) |
| **Trilha de Auditoria Automatizada ISO / GHG Protocol** | Exportação automatizada de relatórios em conformidade direta com as normas ISO 14064 e diretrizes do Programa Brasileiro GHG Protocol. | Versão 3.5 (Curto Prazo) |
| **Multi-Tenancy Lógico Unificado** | Migração opcional de schema-por-planta para banco compartilhado com Row Level Security nativo por `tenant_id`, caso o volume de clientes torne o custo operacional de onboarding por schema um gargalo. | Versão 4.0 (Médio Prazo) |
| **Intensidade de Carbono por Produção em Tempo Real** | Cruzamento automatizado do volume de emissões com a quantidade de peças/toneladas produzidas na planta via ERP/MES. | Versão 4.0 (Médio Prazo) |
| **Simulador "What-If" e Offsetting** | Projeção de cenários de substituição energética e cálculo de fatores de compensação florestal. | Versão 4.5 (Longo Prazo) |
