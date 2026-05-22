import Link from 'next/link'

export function PrivacyNoticeContent() {
  return (
    <>
      <table className="mb-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4 text-left font-semibold">Data</th>
            <th className="py-2 text-left font-semibold">Versão</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2 pr-4">Maio/2026</td>
            <td className="py-2">1.0</td>
          </tr>
        </tbody>
      </table>

      <div className="introducao">
        <p>
          Este Aviso de Privacidade foi elaborado em conformidade com o Marco
          Civil da Internet e com a Lei Geral de Proteção de Dados Pessoais.
        </p>
        <p>
          A aplicação deste Aviso será pautada pelo dever de boa-fé e pela
          observância dos princípios previstos no art. 6º da LGPD dentre eles, o
          da finalidade, da adequação, da necessidade, do livre acesso; da
          qualidade dos dados, da transparência, da prevenção, da não
          discriminação e o da responsabilização e da prestação de contas.
        </p>
      </div>

      <div className="definicoes">
        <h2>1. Definições</h2>
        <p>
          Para melhor compreensão deste documento, neste Aviso de Privacidade,
          consideram-se:
        </p>
        <ol className="list-alpha-paren space-y-4">
          <li>
            <strong>Dado Pessoal:</strong> Informação relacionada a uma pessoa
            natural identificada ou identificável.
          </li>
          <li>
            <strong>Titular:</strong> Pessoa natural a quem se referem os dados
            pessoais que são objeto de tratamento.
          </li>
          <li>
            <strong>Dado Pessoal Sensível:</strong> Dado pessoal sobre origem
            racial ou étnica, convicção religiosa, opinião política, filiação a
            sindicato ou a organização de caráter religioso, filosófico ou
            político, dado referente à saúde ou à vida sexual, dado genético ou
            biométrico, quando vinculado a uma pessoa natural.
          </li>
          <li>
            <strong>Agentes de tratamento:</strong> O controlador e o operador.
            Os indivíduos subordinados ou vinculados, como os funcionários, os
            servidores públicos ou as equipes de trabalho de um órgão ou de uma
            entidade, que atuam sob o poder diretivo do agente de tratamento não
            serão considerados como controladores ou operadores.
          </li>
          <li>
            <strong>Controlador:</strong> órgão da Administração Direta ou
            entidade da Administração Indireta, do Poder Executivo do Município
            do Rio de Janeiro, a quem compete as principais decisões relativas
            aos elementos essenciais para o cumprimento da finalidade do
            tratamento de dados pessoais, bem como a definição da natureza dos
            dados pessoais tratados e a duração do tratamento.
          </li>
          <li>
            <strong>Controladoria Conjunta:</strong> determinação conjunta,
            comum ou convergente, por dois ou mais controladores, das
            finalidades e dos elementos essenciais para a realização do
            tratamento de dados pessoais, por meio de acordo que estabeleça as
            respectivas responsabilidades quanto ao cumprimento da LGPD.
          </li>
          <li>
            <strong>Operador:</strong> Pessoa natural ou jurídica, de direito
            público ou privado, que realiza o tratamento de dados pessoais em
            nome do controlador.
          </li>
          <li>
            <strong>Suboperador:</strong> contratado pelo operador para
            auxiliá-lo a realizar o tratamento de dados pessoais em nome do
            controlador, podendo ser equiparado ao operador perante à LGPD em
            relação às atividades que foi contratado para executar, no que se
            refere às responsabilidades.
          </li>
          <li>
            <strong>Encarregado:</strong> pessoa indicada, mediante ato formal,
            pelo controlador e pelo operador, cujas identidade e informações de
            contato estarão divulgadas publicamente, de forma clara e objetiva,
            preferencialmente no sítio eletrônico do controlador e do operador,
            sendo responsável por atuar como canal de comunicação entre o
            controlador, o operador, os titulares dos dados e a Autoridade
            Nacional de Proteção de Dados – ANPD.
          </li>
          <li>
            <strong>Anonimização:</strong> Utilização de meios técnicos
            razoáveis e disponíveis no momento do tratamento, por meio dos quais
            um dado perde a possibilidade de associação, direta ou indireta, a
            um indivíduo.
          </li>
          <li>
            <strong>Dado Anonimizado:</strong> Dado relativo a um titular que
            não possa ser identificado, considerando a utilização de meios
            técnicos razoáveis e disponíveis na ocasião de seu tratamento.
          </li>
          <li>
            <strong>Autoridade Nacional:</strong> Órgão da administração pública
            responsável por zelar, implementar e fiscalizar o cumprimento desta
            Lei em todo o território nacional.
          </li>
          <li>
            <strong>Banco de Dados:</strong> Conjunto estruturado de dados
            pessoais, estabelecido em um ou em vários locais, em suporte
            eletrônico ou físico.
          </li>
          <li>
            <strong>Consentimento:</strong> manifestação livre, informada e
            inequívoca pela qual o titular concorda com o tratamento de seus
            dados pessoais para uma finalidade determinada, não sendo a única
            nem a principal base legal possível para viabilizar o tratamento de
            dados pessoais.
          </li>
          <li>
            <strong>Incidente de segurança com dados pessoais:</strong> qualquer
            evento adverso confirmado, relacionado à violação na segurança de
            dados pessoais, tais como acesso não autorizado, acidental ou
            ilícito que resulte na destruição, perda, alteração, vazamento ou
            ainda, qualquer forma de tratamento de dados inadequada ou ilícita,
            os quais possam ocasionar risco para os direitos e liberdades do
            titular dos dados pessoais.
          </li>
          <li>
            <strong>Órgão de Pesquisa:</strong> Órgão ou entidade da
            administração pública direta ou indireta ou pessoa jurídica de
            direito privado sem fins lucrativos, legalmente constituída sob as
            leis brasileiras e com sede e foro no País, que inclua em sua missão
            institucional ou em seu objetivo social ou estatutário a pesquisa
            básica ou aplicada de caráter histórico, científico, tecnológico ou
            estatístico.
          </li>
          <li>
            <strong>Transferência Internacional de Dados:</strong> Transferência
            de dados pessoais para país estrangeiro ou organismo internacional
            do qual o país seja membro.
          </li>
          <li>
            <strong>Tratamento:</strong> Toda operação realizada com dados
            pessoais, como as que se referem à coleta, produção, recepção,
            classificação, utilização, acesso, reprodução, transmissão,
            distribuição, processamento, arquivamento, armazenamento,
            eliminação, avaliação ou controle da informação, modificação,
            comunicação, transferência, difusão ou extração.
          </li>
          <li>
            <strong>Uso Compartilhado de Dados:</strong> Comunicação, difusão,
            transferência internacional, interconexão de dados pessoais ou
            tratamento compartilhado de bancos de dados pessoais por órgãos e
            entidades públicos no cumprimento de suas competências legais, ou
            entre esses e entes privados, reciprocamente, com autorização
            específica, para uma ou mais modalidades de tratamento permitidas
            por esses entes públicos, ou entre entes privados.
          </li>
          <li>
            <strong>Ciclo de Vida do Dado:</strong> Conjunto de etapas que um
            dado pessoal percorre desde a coleta até o armazenamento,
            anonimização ou eliminação.
          </li>
          <li>
            <strong>Relatório ou Material Consolidado:</strong> Documento ou
            conjunto de informações gerado a partir dos dados coletados para
            atender às demandas de órgãos competentes.
          </li>
          <li>
            <strong>Finalidade do Tratamento:</strong> Objetivo específico e
            legítimo para o qual os dados pessoais são coletados e utilizados.
          </li>
        </ol>
      </div>

      <div className="base-legal">
        <h2>2. Base legal para tratamento</h2>
        <p ml-4>
          2.1. O tratamento de dados pessoais realizado no âmbito do Sistema
          CIVITAS possui fundamento nas hipóteses previstas no art. 7º, incisos
          II, III e IX da Lei Geral de Proteção de Dados Pessoais – LGPD,
          relacionadas ao cumprimento de obrigação legal ou regulatória, à
          execução de políticas públicas e ao legítimo interesse da
          Administração Pública, observados os princípios da finalidade,
          necessidade, adequação e segurança.
        </p>
      </div>

      <div className="controlador">
        <h2>3. Controlador</h2>
        <h3>3.1. Nome do Controlador</h3>
        <p>
          CIVITAS Rio - Central de Inteligência, Vigilância e Tecnologia em
          Apoio à Segurança Pública
        </p>
        <h3>3.2. Endereço do Controlador</h3>
        <p>Rua Ulysses Guimarães, 300 - Rio de Janeiro, RJ - CEP: 20211-225</p>
        <h3>3.3. Endereço eletrônico do Controlador</h3>
        <p>
          <Link href="mailto:civitas@prefeitura.rio">
            civitas@prefeitura.rio
          </Link>
        </p>
        <h3>3.4. Nome do(a) encarregado(a) de dados do Controlador</h3>
        <p>Luan Ribeiro da Silva</p>
        <h3>3.4.1. E-mail do(a) encarregado(a) de dados do Controlador</h3>
        <p>
          <Link href="mailto:luan.ribeiro@prefeitura.rio">
            luan.ribeiro@prefeitura.rio
          </Link>
        </p>
      </div>

      <div className="direitos-titular">
        <h2>4. Direitos do titular de dados pessoais</h2>
        <p>
          4.1. O titular de dados pessoais possui os direitos previstos na Lei
          Geral de Proteção de Dados Pessoais (LGPD), observadas as limitações
          legais aplicáveis às atividades relacionadas à segurança pública,
          investigação, proteção do interesse público e demais hipóteses
          previstas na legislação vigente.
        </p>
        <ol className="list-alpha-paren space-y-4">
          <li>
            <strong>
              Direito de confirmação e acesso (Art. 18, incisos I e II):
            </strong>{' '}
            é o direito do titular de obter a confirmação da existência de
            tratamento de seus dados pessoais e, quando cabível, acessar as
            informações relacionadas aos seus dados, observadas as hipóteses
            legais de sigilo, restrição de acesso e preservação de atividades de
            segurança pública, inteligência, investigação e fiscalização.
          </li>
          <li>
            <strong>Direito de retificação (Art. 18, inciso III):</strong> é o
            direito do titular de solicitar a correção de dados pessoais
            incompletos, inexatos ou desatualizados, observadas as limitações
            legais e os registros oficiais mantidos pela Administração Pública.
          </li>
          <li>
            <strong>
              Direito à limitação do tratamento dos dados (Art. 18, inciso IV):
            </strong>{' '}
            é o direito do titular de solicitar a revisão de tratamentos
            realizados em desconformidade com a legislação aplicável,
            ressalvadas as hipóteses de conservação necessárias ao cumprimento
            de obrigação legal, preservação do interesse público, segurança
            pública, auditoria, investigação ou exercício regular de
            competências institucionais.
          </li>
          <li>
            <strong>Direito de oposição (Art. 18, § 2º):</strong> é o direito do
            titular de opor-se ao tratamento realizado em desconformidade com a
            Lei Geral de Proteção de Dados Pessoais, observadas as hipóteses
            legais que autorizam a continuidade do tratamento para fins de
            segurança pública, proteção institucional, investigação,
            fiscalização e execução de políticas públicas.
          </li>
          <li>
            <strong>
              Direito de revisão de decisões automatizadas (Art. 20):
            </strong>{' '}
            o titular poderá solicitar a revisão de decisões tomadas unicamente
            com base em tratamento automatizado de dados pessoais que afetem
            seus interesses, observadas as limitações legais aplicáveis às
            atividades relacionadas à segurança pública, inteligência, proteção
            institucional e exercício de competências legais pela Administração
            Pública.
          </li>
        </ol>
      </div>

      <div className="dados-pessoais">
        <h2>5. Quais dados pessoais são tratados</h2>
        <p>
          5.1. A utilização de determinadas funcionalidades do Sistema CIVITAS
          pelo titular de dados pessoais dependerá do tratamento dos seguintes
          dados pessoais:
        </p>
        <ul>
          <li>Nome completo;</li>
          <li>CPF;</li>
          <li>Endereço de e-mail institucional;</li>
          <li>Número de telefone;</li>
          <li>Cargo ou função pública;</li>
          <li>Matrícula;</li>
          <li>Placa de veículo;</li>
          <li>
            Imagens de indivíduos captadas por câmeras de monitoramento,
            passíveis de identificação pessoal;
          </li>
          <li>Registros de login;</li>
          <li>Logs de uso (data, hora, usuário, operação realizada);</li>
          <li>Endereço IP.</li>
        </ul>
      </div>

      <div className="coleta-dados">
        <h2>6. Como os dados são coletados</h2>
        <ol className="list-alpha-paren space-y-4">
          <li>
            <strong>Nome, e-mail e CPF:</strong> informados pelo usuário para
            fins de login e comunicação.
          </li>
          <li>
            <strong>Matrícula, cargo/função pública e telefone:</strong>{' '}
            informados pelo usuário por meio de ofício via email para
            solicitação de demanda.
          </li>
          <li>
            <strong>Placa de veículo:</strong> coletados automaticamente por
            sistemas de monitoramento e fiscalização eletrônica, para fins de
            atendimento a demandas de segurança e mobilidade.
          </li>
          <li>
            <strong>
              Imagens de indivíduos captadas por câmeras de monitoramento,
              passíveis de identificação pessoal:
            </strong>{' '}
            coletada automaticamente por sistemas de monitoramento e integração
            de dados.
          </li>
          <li>
            <strong>Registros do Disque-Denúncia:</strong> coletados por
            atendentes da Central do Disque-Denúncia, durante o registro de
            chamadas, mensagens ou formulários eletrônicos encaminhados pelos
            cidadãos.
          </li>
          <li>
            <strong>Registros da Central 1746:</strong> coletados por meio dos
            canais oficiais de atendimento da Central 1746, incluindo o sistema
            eletrônico, o aplicativo WhatsApp e o atendimento telefônico.
          </li>
          <li>
            <strong>Geolocalização:</strong> coletada automaticamente por
            sistemas de monitoramento, integração de dados urbanos, dispositivos
            de fiscalização eletrônica e sistemas operacionais integrados à
            plataforma CIVITAS.
          </li>
          <li>
            <strong>Registros de login e logs de uso:</strong> gerados
            automaticamente pelo aplicativo da CIVITAS.
          </li>
          <li>
            <strong>Endereço IP:</strong> coletado automaticamente no acesso ao
            sistema.
          </li>
        </ol>
      </div>

      <div className="tratamento-finalidade">
        <h2>7. Qual o tratamento realizado e para qual finalidade</h2>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2 text-left font-semibold">Dado</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Tratamento
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Finalidade
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b align-top">
                <td className="px-3 py-2">Nome completo</td>
                <td className="px-3 py-2">
                  Coleta, armazenamento, classificação, acesso, utilização,
                  comunicação
                </td>
                <td className="px-3 py-2">
                  Informado pelo usuário para identificação e autenticação no
                  sistema
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">CPF</td>
                <td className="px-3 py-2">
                  Coleta, armazenamento, classificação, acesso, utilização,
                  comunicação
                </td>
                <td className="px-3 py-2">Solicitar demandas por ofício</td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">Email</td>
                <td className="px-3 py-2">
                  Coleta, armazenamento, comunicação, acesso, utilização
                </td>
                <td className="px-3 py-2">
                  Envio de notificações, comunicados e acesso ao sistema
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">Matrícula</td>
                <td className="px-3 py-2">
                  Coleta, armazenamento, classificação, acesso, utilização
                </td>
                <td className="px-3 py-2">
                  Emissão de ofícios e confirmação de vínculo funcional
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">Placa de Veículo</td>
                <td className="px-3 py-2">
                  Integração, armazenamento, classificação, acesso, avaliação,
                  utilização
                </td>
                <td className="px-3 py-2">
                  Atendimento a ofícios de órgãos demandantes (Forças de
                  Segurança Pública e Sistema de Justiça)
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">
                  Imagens de câmeras de monitoramento de vias públicas
                </td>
                <td className="px-3 py-2">
                  Coleta, integração, armazenamento, avaliação, acesso,
                  utilização
                </td>
                <td className="px-3 py-2">
                  Atendimento a ofícios de órgãos demandantes (Forças de
                  Segurança Pública e Sistema de Justiça)
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">Registros Disque-Denúncia</td>
                <td className="px-3 py-2">
                  Integração, armazenamento, classificação, acesso, avaliação,
                  utilização
                </td>
                <td className="px-3 py-2">
                  Geração de relatório, identificação de problemas do município
                  e apoio a órgãos competentes
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">Registros Central 1746</td>
                <td className="px-3 py-2">
                  Integração, armazenamento, classificação, acesso, avaliação,
                  utilização
                </td>
                <td className="px-3 py-2">
                  Geração de relatório, identificação de problemas do município
                  e apoio a órgãos competentes
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">Geolocalização</td>
                <td className="px-3 py-2">
                  Coleta, armazenamento, avaliação, acesso, utilização
                </td>
                <td className="px-3 py-2">
                  Geração de relatório, identificação de deslocamentos e apoio a
                  órgãos competentes
                </td>
              </tr>
              <tr className="border-b align-top">
                <td className="px-3 py-2">
                  Dados de acesso (logs de uso do sistema)
                </td>
                <td className="px-3 py-2">
                  Coleta, armazenamento, avaliação, acesso, utilização
                </td>
                <td className="px-3 py-2">
                  Segurança da informação e apuração de incidentes
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="definicao-tipos-tratamento">
        <h3>Definição de tipos de tratamento</h3>
        <ol className="list-alpha-paren space-y-4">
          <li>
            <strong>ACESSO</strong> — ato de ingressar, transitar, conhecer ou
            consultar a informação, bem como possibilidade de usar os ativos de
            informação de um órgão ou entidade, observada eventual restrição que
            se aplique.
          </li>
          <li>
            <strong>ARMAZENAMENTO</strong> — ação ou resultado de manter ou
            conservar em repositório um dado.
          </li>
          <li>
            <strong>AVALIAÇÃO</strong> — analisar o dado com o objetivo de
            produzir informação.
          </li>
          <li>
            <strong>CLASSIFICAÇÃO</strong> — maneira de ordenar os dados
            conforme algum critério estabelecido.
          </li>
          <li>
            <strong>COLETA</strong> — recolhimento de dados com finalidade
            específica.
          </li>
          <li>
            <strong>COMUNICAÇÃO</strong> — transmitir informações pertinentes a
            políticas de ação sobre os dados.
          </li>
          <li>
            <strong>CONTROLE</strong> — ação ou poder de regular, determinar ou
            monitorar as ações sobre o dado.
          </li>
          <li>
            <strong>DIFUSÃO</strong> — ato ou efeito de divulgação, propagação,
            multiplicação dos dados.
          </li>
          <li>
            <strong>DISTRIBUIÇÃO</strong> — ato ou efeito de dispor de dados de
            acordo com algum critério estabelecido.
          </li>
          <li>
            <strong>ELIMINAÇÃO</strong> — ato ou efeito de excluir ou destruir
            dado do repositório.
          </li>
          <li>
            <strong>EXTRAÇÃO</strong> — ato de copiar ou retirar dados do
            repositório em que se encontrava.
          </li>
          <li>
            <strong>MODIFICAÇÃO</strong> — ato ou efeito de alteração do dado.
          </li>
          <li>
            <strong>PROCESSAMENTO</strong> — ato ou efeito de processar dados
            visando organizá-los para obtenção de um resultado determinado.
          </li>
          <li>
            <strong>PRODUÇÃO</strong> — criação de bens e de serviços a partir
            do tratamento de dados.
          </li>
          <li>
            <strong>RECEPÇÃO</strong> — ato de receber os dados ao final da
            transmissão.
          </li>
          <li>
            <strong>REPRODUÇÃO</strong> — cópia de dado preexistente obtido por
            meio de qualquer processo.
          </li>
          <li>
            <strong>TRANSFERÊNCIA</strong> — mudança de dados de uma área de
            armazenamento para outra, ou para terceiro.
          </li>
          <li>
            <strong>TRANSMISSÃO</strong> — movimentação de dados entre dois
            pontos por meio de dispositivos elétricos, eletrônicos,
            telegráficos, telefônicos, radioelétricos, pneumáticos etc.
          </li>
          <li>
            <strong>UTILIZAÇÃO</strong> — ato ou efeito do aproveitamento dos
            dados.
          </li>
        </ol>
      </div>

      <div className="compartilhamento-dados">
        <h2>8. Compartilhamento de dados</h2>
        <p>
          Os dados pessoais tratados pelo Sistema CIVITAS poderão ser
          compartilhados com órgãos e entidades da Administração Pública,
          integrantes do Sistema de Justiça e Forças de Segurança Pública,
          quando necessário ao exercício de competências legais, à execução de
          políticas públicas, à proteção do interesse público, à investigação de
          ocorrências ou ao atendimento de solicitações formalmente
          fundamentadas.
        </p>
        <p>
          Sempre que aplicável, o compartilhamento ocorrerá mediante solicitação
          formal regularmente assinada pela autoridade competente do órgão
          requisitante, conforme previsto no Decreto Rio nº 57.481, de 12 de
          janeiro de 2026.
        </p>
      </div>

      <div className="transferencia-internacional-dados">
        <h2>9. Transferência internacional de dados</h2>
        <p>
          9.1. O Sistema CIVITAS opera em infraestrutura tecnológica provida
          pela Empresa Municipal de Informática do Rio de Janeiro – IplanRio,
          responsável pela gestão dos serviços de computação em nuvem utilizados
          pelos órgãos do Poder Executivo Municipal.
        </p>
        <p>
          9.2. O ambiente de dados da CIVITAS é hospedado na Google Cloud
          Platform (GCP), contratada pela IplanRio, e adota arquitetura
          multi-region. Isso significa que os dados podem ser armazenados de
          forma distribuída em datacenters localizados em diferentes regiões do
          mundo, conforme parâmetros técnicos de disponibilidade, desempenho e
          segurança definidos pelo provedor.
        </p>
        <p>
          9.3. Essa configuração não caracteriza transferência internacional
          intencional de dados pessoais, mas sim um modelo de armazenamento e
          processamento distribuído, utilizado para garantir resiliência,
          continuidade operacional e alta disponibilidade dos serviços.
        </p>
        <p>
          9.4. A CIVITAS atua como controladora dos dados pessoais tratados no
          sistema, sendo responsável pela definição das finalidades, bases
          legais e políticas de tratamento. A IplanRio atua como operadora,
          assegurando a gestão técnica e a segurança da infraestrutura, enquanto
          a Google LLC é suboperadora, vinculada a cláusulas contratuais que
          impõem padrões de proteção compatíveis com a Lei Geral de Proteção de
          Dados (Lei nº 13.709/2018).
        </p>
        <p>
          9.5. As atividades realizadas pela CIVITAS dentro desse ambiente em
          nuvem seguem as diretrizes da Política Municipal de Segurança da
          Informação (Decreto Rio nº 53.700/2023) e do Programa de Governança em
          Privacidade e Proteção de Dados Pessoais (Resolução SEGOVI nº
          91/2022).
        </p>
        <p>
          9.6. A Política de Privacidade da Google Cloud, contendo informações
          sobre tratamento de dados e locais de processamento, pode ser
          consultada em:{' '}
          <Link
            href="https://cloud.google.com/terms/cloud-privacy-notice?hl=pt-BR"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            https://cloud.google.com/terms/cloud-privacy-notice?hl=pt-BR
          </Link>
          .
        </p>
      </div>

      <div className="seguranca-dados">
        <h2>10. Segurança dos dados</h2>
        <p>
          10.1. O Sistema CIVITAS adota medidas técnicas, administrativas e
          organizacionais voltadas à proteção dos dados pessoais tratados em
          seus ambientes tecnológicos e operacionais, observando as diretrizes
          da Política Municipal de Segurança da Informação – PSI, instituída
          pelo Decreto Rio nº 53.700, de 8 de dezembro de 2023, e demais normas
          aplicáveis.
        </p>
        <p>
          10.2. O acesso às informações tratadas no Sistema CIVITAS é restrito
          aos usuários autorizados e vinculados às finalidades institucionais
          compatíveis com suas atribuições funcionais.
        </p>
      </div>

      <div className="cookies">
        <h2>11. Cookies</h2>
        <p>
          O Sistema CIVITAS utiliza exclusivamente cookies técnicos e
          estritamente necessários ao funcionamento adequado de suas
          funcionalidades essenciais, incluindo autenticação de usuários,
          manutenção de sessão, segurança operacional e estabilidade da
          aplicação.
        </p>
        <p>
          Esses cookies são utilizados com fundamento no legítimo interesse da
          Administração Pública, nos termos do art. 7º, inciso IX, da LGPD, e
          permanecem ativos apenas durante a sessão do usuário ou pelo período
          estritamente necessário à execução da funcionalidade correspondente.
        </p>
        <p>As informações coletadas por meio desses cookies:</p>
        <ul>
          <li>não são utilizadas para fins publicitários;</li>
          <li>
            não são compartilhadas com terceiros para finalidades comerciais;
          </li>
          <li>não são utilizadas para criação de perfis comportamentais;</li>
          <li>limitam-se às finalidades técnicas e operacionais do sistema.</li>
        </ul>
      </div>

      <div className="tratamento-posterior-dados">
        <h2>12. Tratamento posterior dos dados para outras finalidades</h2>
        <p>
          Os dados pessoais tratados pela CIVITAS poderão, em determinadas
          situações, ser utilizados para finalidades secundárias, desde que
          <strong> compatíveis com o propósito original da coleta</strong> e
          amparados por bases legais previstas na Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018).
        </p>
        <p>
          De acordo com o inventário de dados da instituição, os tratamentos
          posteriores mais comuns incluem:
        </p>
        <ul>
          <li>
            Utilização de dados provenientes dos canais de atendimento (ex.:
            1746, Disque Denúncia, Fogo Cruzado) para geração de{' '}
            <strong>
              estatísticas, relatórios, análises de inteligência e apoio a
              políticas públicas
            </strong>
            ;
          </li>
          <li>
            Reutilização de informações coletadas em sistemas de monitoramento e
            trânsito (ex.: radares, OCR) para{' '}
            <strong>
              apoio a órgãos de segurança e justiça em investigações e operações
            </strong>
            ;
          </li>
          <li>
            Uso de informações em atividades de{' '}
            <strong>
              comunicação institucional e relacionamento com a mídia
            </strong>
            , respeitando a legislação de transparência e a proteção de dados
            pessoais.
          </li>
        </ul>
        <p>
          Caso seja necessário utilizar os dados pessoais para finalidades
          distintas das previstas originalmente e que não sejam compatíveis ou
          não tenham previsão legal específica, a CIVITAS informará o titular,
          nos termos da LGPD, salvo quando o tratamento decorrer de obrigação
          legal, regulatória ou atender ao interesse público.
        </p>
      </div>

      <div className="mudancas">
        <h2>13. Mudanças</h2>
        <p>
          13.1. A presente versão 1.0 deste instrumento foi atualizada pela
          última vez em: Maio/2026.
        </p>
        <p>
          13.2. O editor se reserva o direito de modificar no site, a qualquer
          momento, as presentes normas, especialmente para adaptá-las às
          evoluções do Sistema CIVITAS, seja pela disponibilização de novas
          funcionalidades, seja pela supressão ou modificação daquelas já
          existentes.
        </p>
        <p>
          13.3. Qualquer alteração e/ou atualização neste instrumento passará a
          vigorar a partir da data de sua publicação no sítio do serviço e
          deverá ser integralmente observada pelos Usuários.
        </p>
      </div>

      <div className="foro">
        <h2>14. Foro</h2>
        <p>
          14.1.1 Este instrumento será regido pela legislação brasileira. Fica
          eleito o Foro Central da Comarca da Capital do Estado do Rio de
          Janeiro para dirimir quaisquer dúvidas, renunciando as partes desde já
          a qualquer outro, por mais especial ou privilegiado que seja.
        </p>
      </div>
    </>
  )
}
