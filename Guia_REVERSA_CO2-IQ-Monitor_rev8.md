# Guia de Aplicação do Framework REVERSA para o Projeto CO2·IQ Monitor (Rev 8)

> **Nota de revisão (Rev 8):** Espelho do Memorial Descritivo `CO2-IQ-Monitor_rev8.md`. O projeto passa a ser referido pelo nome comercial **CO2·IQ Monitor**. QField/QFieldCloud permanecem o cliente de campo e a sincronização atuais — não a identidade do produto e sem fork na V1. Incorporam-se ao roteiro de implementação as Seções 5.7 (contrato do QR Code como identificador, não cálculo), 5.8 (georreferência dupla: ativo × visita) e 5.9 (ritmo mensal/trimestral versus inventário anual). A sequência de agentes REVERSA não muda.
>
> **Nota de revisão (Rev 7):** Ajuste de nomenclatura em espelho ao memorial — a role de escrita bruta por planta passou a se chamar `field_ingest_{planta_id}` (antes `qfield_{planta_id}`), e a captura do nome do operador é referida como regra de payload, não mais como expressão específica do QField. Nenhuma etapa, agente ou sequência do REVERSA foi alterada.

Para criar o aplicativo de monitoramento de emissões de CO₂ industrial baseado no Memorial Descritivo `CO2-IQ-Monitor_rev8.md`, você deve seguir o Ato 2 — Ideação e Concepção Greenfield (Tier 2) do framework REVERSA (https://github.com/sandeco/reversa).  
Como se trata de um projeto novo ("do zero"), o fluxo foca na definição da proposta de valor, das jornadas do usuário e na especificação técnica e metodológica (GHG Protocol, fatores do SIN e balanço de massa do IPCC) antes da codificação. Abaixo, descrevo a sequência de funções (agentes) que você deve utilizar:  

## Sequência Recomendada de Funções

* **reversa-brainstorm:** Inicie aqui para orquestrar a sessão de ideação do projeto CO2·IQ Monitor. Esta função irá preparar o terreno para alinhar o escopo da solução geoespacial, a governança de dados, o nome comercial (distinto do cliente de campo QField) e os requisitos regulatórios ambientais de cálculo.  
* **reversa-framer:** Fundamental para diagnosticar o "problema raiz". Aqui você definirá a dor real da empresa (gestão ambiental manual, risco de não-conformidade com o GHG Protocol/ISO 14064, inspeções mensais/trimestrais lançadas no ativo errado e lentidão em auditorias) em contrapartida à solução proposta (identificação unívoca via QR Code, georreferência dupla ativo/visita, cálculo preliminar visual, persistência em banco relacional e atalho para dashboard web).  
* **reversa-explorer:** Utilize para listar as abordagens técnicas e metodológicas (ex.: comparação entre usar QFieldCloud com gravação nativa no Supabase vs. APIs customizadas; bibliotecas analíticas como GeoPandas vs. scripts SQL/PostGIS puros; e integração das matrizes mensais de fatores médios/marginais do SIN via API do MCTI).  
* **reversa-challenger:** Essencial para realizar o premortem do projeto. Questionar, por exemplo: "E se a conexão cair em campo?" (validando a operação offline via GeoPackage), "Como garantir a integridade dos fatores de emissão em auditorias?" (governança e versionamento de tabelas de fatores de emissão) ou "Quais os riscos de integridade dos dados espaciais no PostGIS?".  
* **reversa-arbiter:** O juiz que tomará a decisão sobre a arquitetura (Stack consolidada: QGIS e QField como cliente de campo atual — Seção 5.6, sem fork —, Supabase/PostgreSQL com PostGIS como fonte da verdade, tabelas versionadas de fatores de conversão, motor Python para cálculo oficial em Escopos 1 e 2, e Dashboard Web em HTML/JS/Leaflet). O produto chama-se CO2·IQ Monitor; QField não é identidade.  
* **reversa-pre-spec:** Consolida os requisitos mínimos, equações matemáticas de conversão estequiométrica/fator de atividade e arquitetura de dados para que a equipe de desenvolvimento inicie a implementação com total aderência normativa.  

---

## Transição para o Ato 3 (Ciclo Forward)

Para garantir que seu aplicativo não seja apenas funcional, mas também sustentável, auditável, escalável e pronto para o mercado (seguindo as melhores práticas de engenharia e as normas que o REVERSA impõe), você deve transitar do Ato 2 (Ideação) para o Ato 3 (Ciclo Forward).  

O REVERSA impõe uma governança baseada em rastreabilidade (cada linha de código ligada a um requisito funcional e metodológico) e qualidade (testes unitários com dados de referência de inventários oficiais). Aqui está o roteiro de como continuar após o `reversa-pre-spec` para garantir essa qualidade profissional:

### 1. Inicie o Ciclo de Execução com `reversa-forward`
Após o pre-spec, o projeto está "maduro" no nível de conceito. O agente `reversa-forward` é o "Maestro do Código". Ele vai mapear o estágio físico do seu projeto e garantir que a estrutura de tabelas, modelos espaciais e rotinas de cálculo não se desviem da especificação (SDD) criada no Ato 2.  
* **Por que isso atende seu requisito?** Impede o desvio de escopo e inconsistências nas fórmulas físico-químicas de emissão, mantendo a estrutura lógica perfeitamente alinhada às normas ambientais.

### 2. Decomposição com `reversa-to-do` (O "Segredo" da Organização)
Para garantir facilidade em implementações e correções futuras, quebre o projeto em uma planilha atômica de tarefas:  
* **Aplicação no seu caso:** Separe em tarefas como:
  1. Modelagem relacional e espacial no PostgreSQL/PostGIS (schema compartilhado `core` para fatores de emissão e enum de status; schema dedicado por planta para ativos e coletas; roles de serviço `field_ingest_{planta_id}`, `calc_engine`, `gestor_auditor` e `emission_factor_admin` com GRANTs de tabela/coluna já definidos no Bloco 1 — ver `CO2-IQ-Monitor_rev8.md`, Seção 5.4);
  2. Estruturação do formulário no QGIS (validações, máscaras, captura nominal do operador via payload — ver Seção 5.4/5.6 do memorial — e cálculo preliminar visual);
  3. Parametrização do QField/QFieldCloud (cliente de campo atual — ver Seção 5.6) em modo *Offline Editing* e teste de rotina *offline-first* — sem fork;
  4. Contrato do QR Code (Seção 5.7): plaqueta com identidade estável (`CO2IQ|<planta>|<ativo>|<TAG>`), cadastro em `ativos_fabris`, consumo apenas na visita; rejeição de QR desconhecido;
  5. Georreferência dupla (Seção 5.8): coordenada de cadastro do ativo versus GPS da visita, com fila de atenção se a distância estourar o raio configurado;
  6. Desenvolvimento do motor de cálculo oficial em Python (`pandas`/`sqlalchemy`), executado sob a role `calc_engine`, implementando o contrato de resolução dinâmica do fator vigente (`ORDER BY vigencia_inicio DESC LIMIT 1`, Seção 5.2) e a transição de status `rascunho → calculado` via trigger de banco;
  7. Construção da tela/fluxo de validação e exportação para a role `gestor_auditor` (transições `calculado → validado → exportado`);
  8. Construção e integração do Dashboard Web interativo com Leaflet.js, mapa da planta (ativo e última visita) e gráficos analíticos de conformidade.
* **Vantagem de mercado:** Cria um rastro rigoroso de auditoria. Cada alteração de fórmula ou inclusão de combustível possui histórico rastreável via controle de versão.

### 3. Implementação e Testes (`reversa-coding`)
Ao usar o `reversa-coding`, o agente não apenas escreve o código, ele escreve testes unitários e de integração validando os resultados contra inventários-padrão do GHG Protocol:  
* **Norma de Mercado:** Para ser aceito em auditorias ISO 14064, órgãos ambientais estaduais/federais e lojas de apps, a validação de cálculo numérico e resiliência offline é inegociável. O `reversa-coding` assegura cobertura de testes para cálculos de Escopo 1, Escopo 2 (SIN), integridade de coordenadas GPS e para as transições permitidas/bloqueadas da máquina de estados (`core.valida_transicao_coleta()`).

### 4. Ciclo de Fechamento (`reversa-sync`)
O `reversa-sync` converge o código construído de volta para as especificações técnicas gerais:  
* **O que faz:** Se durante a codificação houver ajustes na estrutura de tabelas de emissão ou nos endpoints de integração, o `reversa-sync` sincroniza e atualiza automaticamente os memoriais e o SDD.  
* **Vantagem de mercado:** Mantém a documentação técnica perfeitamente alinhada ao código em produção, viabilizando auditorias de terceira parte sem passivos documentais.

---

## Resumo do Pipeline de Qualidade Profissional

| Ação | Resultado para o seu App |
| :--- | :--- |
| **Pós-Spec (`reversa-forward`)** | Garante que a fundação siga a arquitetura e metodologia matemática definida. |
| **Organização (`reversa-to-do`)** | Cria o roadmap atômico, contemplando desde a camada GIS até a governança dos fatores de emissão. |
| **Construção (`reversa-coding`)** | Escreve código com testes matemáticos e de integridade espacial, garantindo precisão e conformidade. |
| **Governança (`reversa-sync`)** | Mantém a documentação (SDD e Memorial) 100% atualizada com o código real em produção. |

> **Dica de Ouro para a Aceitação em Auditorias e Certificações:**  
> Como o projeto lida com dados sensíveis de auditoria de emissões de CO₂ e coordenadas geográficas de plantas fabris, garanta que durante a execução do `reversa-coding` sejam especificados: logs de auditoria imutáveis, tratamento de dados em modo desconectado (*offline-first*) no QField e parametrização explícita das fontes dos fatores de conversão (MCTI/SIN e IPCC/GHG Protocol). O REVERSA garantirá que esses requisitos não-funcionais constem no `requirements.md` e `actions.md` desde a concepção inicial.
>
> **Atualização (Rev 7):** O Bloco 1 (schema, governança e máquina de estados) foi formalizado em DDL e revisado tecnicamente em seis rodadas de correção, todas consolidadas nas Seções 5.2, 5.4 e 5.5 do Memorial Descritivo `CO2-IQ-Monitor_rev8.md`. Ficam definidos como contrato de implementação: (i) a máquina de estados de 4 fases (`rascunho → calculado → validado → exportado`) enforçada por uma única função-trigger centralizada em `core.valida_transicao_coleta()`, reutilizada por todos os schemas `planta_*`; (ii) quatro roles de serviço com escopo de escrita disjunto — `field_ingest_{planta_id}` (append-only bruto), `calc_engine` (colunas de cálculo), `gestor_auditor` (colunas de validação/exportação) e `emission_factor_admin` (fatores normativos, sem `UPDATE`/`DELETE`); (iii) resolução do fator de emissão vigente por consulta dinâmica (`vigencia_inicio` decrescente), sem depender de `vigencia_fim` nunca ser fechado; (iv) credenciais injetadas via variável de sessão do `psql`, nunca em texto puro; (v) exclusão de `core`/`planta_*` da API PostgREST do Supabase. Cabe ao `reversa-coding` implementar exatamente esse contrato — inclusive replicando a ressalva de que `ALTER DEFAULT PRIVILEGES` cobre apenas os GRANTs de tabela inteira do `field_ingest_{planta_id}`; os GRANTs coluna-específicos de `calc_engine` e `gestor_auditor` não são automatizáveis por essa via e exigem concessão manual a cada tabela nova, conforme o runbook de onboarding da Seção 5.5. A Seção 5.6 (nova na Rev 7) formaliza que essa governança é agnóstica ao cliente de campo — QField é a escolha atual, não um requisito de arquitetura.
>
> **Atualização (Rev 8):** Em espelho ao memorial `CO2-IQ-Monitor_rev8.md`: (i) nome comercial **CO2·IQ Monitor**; (ii) Seção 5.7 — QR é identificador, não depósito de fator/consumo; (iii) Seção 5.8 — lat/long de cadastro do ativo e lat/long da visita, com alerta de raio; (iv) Seção 5.9 — coleta no ritmo mensal/trimestral da planta, inventário anual como soma; (v) V1 é inventário por dado de atividade, não CEMS; (vi) sem fork de QField/QFieldCloud. Cabe ao `reversa-coding` implementar exatamente esses contratos de campo além do Bloco 1 já formalizado. Próxima etapa: Sandbox/PoC de sincronização real do QFieldCloud contra o schema dedicado, antes do avanço ao Bloco 2 (QGIS Desktop / Formulários).
