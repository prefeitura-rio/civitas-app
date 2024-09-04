import { Clock, LayoutDashboard, MapPinned } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { Tag } from './card/components/sub-card/components/tag'

export type TagType = 'Adicionado' | 'Alterado' | 'Corrigido' | 'Removido'

export interface SubCard {
  title: string
  tag: TagType
  content: ReactNode
}

export interface Card {
  title: string
  subCards: SubCard[]
}

export const changelog: Card[] = [
  {
    title: '04 de Setembro de 2024',
    subCards: [
      {
        tag: 'Adicionado',
        title: 'Alerta de suspeita de placa clonada no relatório',
        content: (
          <>
            <Image
              src="https://storage.googleapis.com/rj-civitas-public/assets/alerta-suspeita-placa-clonada.png"
              alt=""
              width={745}
              height={735}
              className="mb-10"
            />
            <p>
              O alerta de suspeita de placa clonada, já presente no app, foi
              introduzido também no relatório de busca por placa.
            </p>
            <p>
              O alerta é acionado quando o intervalo de tempo e a distância
              entre dois pontos de detecção são incompatíveis, sugerindo que
              dois veículos com a mesma placa possam estar circulando
              simultaneamente.
            </p>
            <p>
              A lógica de detecção considera como anômalo qualquer deslocamento
              que exigiria uma velocidade média superior a 110 km/h entre dois
              pontos consecutivos, considerando a distância em linha reta.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: '03 de Setembro de 2024',
    subCards: [
      {
        tag: 'Adicionado',
        title: 'Novo módulo Ocorrências',
        content: (
          <>
            <p>
              O módulo Ocorrências visa integrar dados do{' '}
              <span className="code">Disque Denúncia</span> e do{' '}
              <span className="code">1746</span>, proporcionando uma visão ampla
              e detalhada das denúncias registradas na cidade. A seguir,
              detalhamos suas principais funcionalidades:
            </p>
            <div className="flex gap-2">
              <Clock className="mb-4 mt-6 size-6" />
              <h4>Histórico de Denúncias em Linha do Tempo</h4>
            </div>
            <p>
              A nova funcionalidade permite a visualização das ocorrências em um
              formato cronológico, organizado em uma linha do tempo. O objetivo
              é facilitar o acompanhamento do histórico das denúncias
              registradas. Para melhor navegação e análise, o módulo oferece
              paginação e os seguintes filtros:
            </p>
            <ul>
              <li>
                <code>Data</code>: permite a seleção de um período específico de
                ocorrências;
              </li>
              <li>
                <code>Palavras-chave</code>: possibilita a busca por termos
                relevantes contidos nas denúncias;
              </li>
              <li>
                <code>Categoria</code>: filtra as ocorrências de acordo com a
                sua classificação (denúncia ou serviço);
              </li>
              <li>
                <code>Fonte</code>: permite a escolha entre as bases de dados
                "Disque Denúncia" e "1746".
              </li>
            </ul>

            <div className="flex gap-2">
              <MapPinned className="mb-4 mt-6 size-6" />
              <h4>Mapa Interativo</h4>
            </div>
            <p>
              O módulo também apresenta uma visualização por meio de um mapa
              interativo, onde as ocorrências são georreferenciadas e
              representadas por ícones. Ao interagir com o mapa, passando o
              mouse sobre os ícones, é possível visualizar os detalhes de cada
              denúncia. Adicionalmente, o usuário pode alternar entre dois modos
              de exibição:
            </p>
            <ul>
              <li>
                <code>Visualização por ícones</code>: cada ocorrência é
                representada por um marcador individual no mapa;
              </li>
              <li>
                <code>Mapa de calor</code>: as ocorrências são exibidas de
                acordo com a densidade geográfica, destacando áreas com maior
                concentração de denúncias.
              </li>
            </ul>

            <div className="flex gap-2">
              <LayoutDashboard className="mb-4 mt-6 size-6" />
              <h4>Dashboard de Visualizações Gráficas</h4>
            </div>
            <p>
              Para complementar a análise dos dados filtrados, o módulo
              Ocorrências oferece um dashboard com três tipos de gráficos,
              conforme detalhado a seguir:
            </p>
            <ol>
              <li>
                <code>
                  Número Total de Ocorrências ao Longo do Tempo por Fonte
                </code>
                : gráfico de linha que demonstra a variação do número de
                ocorrências, categorizadas por sua fonte de origem, ao longo de
                um período selecionado.
              </li>
              <li>
                <code>Top 5 Subtipos de Ocorrências</code>: gráfico de barras
                que exibe os cinco subtipos de ocorrências mais frequentes.
              </li>
              <li>
                <code>Distribuição das Fontes de Ocorrências</code>: gráfico de
                pizza que apresenta a proporção das denúncias originadas das
                diferentes fontes integradas.
              </li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    title: '22 de Agosto de 2024',
    subCards: [
      {
        tag: 'Adicionado',
        title: 'Nova camada "Fogo Cruzado" no mapa interativo',
        content: (
          <>
            <p>
              Agora, o mapa interativo conta com a camada "Fogo Cruzado",
              trazendo informações detalhadas sobre tiroteios e disparos de arma
              de fogo na cidade do Rio de Janeiro. Essa camada utiliza dados
              fornecidos pelo Instituto Fogo Cruzado, que monitora a violência
              armada em áreas urbanas.
            </p>
            <p>
              Os dados são coletados em tempo real através de um aplicativo, e
              alimentam o primeiro banco de dados abertos sobre violência armada
              na América Latina. Com esta nova camada, os usuários têm acesso a
              informações relevantes e atualizadas sobre incidentes de violência
              armada no Rio de Janeiro.
            </p>
          </>
        ),
      },
      {
        tag: 'Adicionado',
        title: 'Botão para tornar a senha visível durante o login',
        content: (
          <>
            <p>
              Para melhorar a experiência de login foi adicionado um botão para
              visualizar a senha digitada, facilitando a conferência da senha
              antes de se confirmar as credenciais.
            </p>
            <p className="z-50">
              Essa funcionalidade ajuda a evitar erros de digitação e
              proporciona maior confiança ao fazer login no sistema.
            </p>
            <div className="-mt-4">
              <Image
                src={
                  'https://storage.googleapis.com/rj-civitas-public/assets/login-password-eye-button-edit.gif'
                }
                className="z-10"
                alt=""
                width={968}
                height={544}
              />
            </div>
          </>
        ),
      },
      {
        tag: 'Adicionado',
        title: 'Indicadores de estado sobre as camadas do mapa',
        content: (
          <>
            <p>
              Para garantir uma experiência de usuário mais clara e informativa
              ao interagir com as camadas do mapa, foram criados 3 estados para
              os seus interruptores:
            </p>
            <ul className="list-decoration">
              <li>
                <span className="font-bold text-muted-foreground">
                  Em processamento:
                </span>{' '}
                Indica que os dados da camada estão sendo processados e ainda
                não estão prontos para uso.
              </li>
              <li>
                <span className="font-bold text-emerald-500">Ativo:</span>{' '}
                Indica que os dados da camada foram processados com sucesso e
                estão prontos para uso.
              </li>
              <li>
                <span className="font-bold text-destructive">
                  Indisponível:
                </span>{' '}
                Indica que houve um erro durante o processamento dos dados da
                camada e, em caso de persistência do erro, um administrador do
                sistema deve ser contatado para tratar o erro.
              </li>
            </ul>
            <div className="my-8">
              <Image
                src="https://storage.googleapis.com/rj-civitas-public/assets/map-layers-loading-spinner-and-fail-alert-edit.gif"
                alt=""
                width={1280}
                height={720}
              />
            </div>
          </>
        ),
      },
    ],
  },
  {
    title: '19 de Agosto de 2024',
    subCards: [
      {
        tag: 'Corrigido',
        title: 'Erro na consulta de placas para data específica',
        content: (
          <p>
            Foi corrigido um erro na funcionalidade de consulta de placas de
            veículos, que ocorria ao pesquisar em intervalos de datas que
            incluíam o dia 20/06/2024. Agora, as buscas nessas datas são
            processadas corretamente, sem gerar falhas.
          </p>
        ),
      },
    ],
  },
  {
    title: '13 de Agosto de 2024',
    subCards: [
      {
        tag: 'Alterado',
        title: 'Campo de busca por endereço agora abrange câmeras e radares',
        content: (
          <>
            <p>
              O campo de busca por endereço no mapa foi aprimorado e agora
              permite a pesquisa por câmeras do COR e radares utilizando seus
              respectivos códigos.
            </p>
            <p>
              A identificação do tipo de busca será feita da seguinte maneira:
            </p>
            <ol>
              <li className="ml-4 list-inside list-decimal font-medium">
                Busca por endereço:
              </li>
              <ul>
                <li className="ml-8">
                  Para localizar um endereço, inicie a digitação no campo de
                  busca e selecione uma das <code>sugestões de endereços</code>{' '}
                  que aparecerão abaixo.
                </li>
              </ul>
              <li className="ml-4 list-inside list-decimal font-medium">
                Busca por câmera do COR:
              </li>
              <ul>
                <li className="ml-8">
                  Para encontrar uma câmera do COR, digite os 6 dígitos
                  correspondentes ao código da câmera e pressione{' '}
                  <code>ENTER</code>.
                </li>
              </ul>
              <li className="ml-4 list-inside list-decimal font-medium">
                Busca por radar:
              </li>
              <ul>
                <li className="ml-8">
                  Para localizar um radar, insira o{' '}
                  <code>Número da Câmera</code> ou o <code>Código CET-Rio</code>{' '}
                  correspondente e pressione <code>ENTER</code>. Ambos os
                  códigos devem ter mais de 6 dígitos, o que permite distinguir
                  os radares das câmeras.
                </li>
              </ul>
            </ol>
            <p>
              Se uma câmera ou radar não forem encontrados, uma notificação de
              aviso será exibida, informando a falha na busca.
            </p>
          </>
        ),
      },
      {
        tag: 'Adicionado',
        title: 'Velocidade do veículo na busca por placa',
        content: (
          <>
            <p>
              A informação da velocidade do veículo no ponto de detecção passa a
              ser incluída no resultado de buscas por placa, tanto no resultado
              direto da busca quanto no relatório em PDF."
            </p>
            <div className="flex flex-col items-center gap-3">
              <div>
                <Image
                  src="https://storage.googleapis.com/rj-civitas-public/assets/velocidade_display_trip_list.png"
                  alt=""
                  width={361}
                  height={251}
                />
                <span className="text-sm leading-4 text-muted-foreground"></span>
              </div>
              <div>
                <Image
                  src="https://storage.googleapis.com/rj-civitas-public/assets/velocidade_relatorio.png"
                  alt=""
                  width={790}
                  height={256}
                />
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  {
    title: '8 de Agosto de 2024',
    subCards: [
      {
        tag: 'Alterado',
        title: 'Alertas de placas monitoradas no Discord',
        content: (
          <>
            {/* <Image
              src="https://storage.googleapis.com/rj-civitas-public/assets/Captura%20de%20tela%202024-08-08%20201549.png"
              alt="Exemplo da nova notificação contendo a informação de atraso"
            /> */}
            <span className="">Contexto:</span>
            <p>
              Recentemente, identificamos que alguns alertas têm sido publicados
              com atrasos significativos, chegando a múltiplas horas após a
              detecção inicial. Embora a maioria dos alertas chegue em tempo
              hábil, atrasos maiores podem causar confusão na avaliação da
              situação e no planejamento de respostas.
            </p>

            <span>Alterações implementadas:</span>
            <ol>
              <li className="ml-4 list-inside list-decimal">
                Inclusão da Informação de Atraso nos Alertas:
              </li>
              <ul>
                <li className="ml-8">
                  Agora, todas as mensagens de detecção incluirão uma informação
                  de atraso, indicando o tempo decorrido entre a detecção do
                  veículo e a publicação do alerta. Essa melhoria permite que os
                  operadores avaliem a urgência de cada mensagem com maior
                  precisão.
                </li>
              </ul>

              <li className="ml-4 list-inside list-decimal">
                Redirecionamento de Alertas com Atraso Superior a 1 Hora:
              </li>
              <ul>
                <li className="ml-8">
                  Mensagens com atraso superior a 1 hora não serão mais
                  publicadas nos canais principais de operação. Em vez disso,
                  essas mensagens serão direcionadas para um canal específico
                  chamado #debug, garantindo o registro sem interferir nas
                  operações em tempo real.
                </li>
              </ul>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    title: '5 de Agosto de 2024',
    subCards: [
      {
        title: 'Histórico de Atualizações',
        tag: 'Adicionado',
        content: (
          <>
            <p>
              A partir de agora, todas as novas atualizações do sistema serão
              documentadas aqui, no <code>Histórico de Atualizações</code>.
            </p>
            <p>
              As atualizações serão organizadas por{' '}
              <code>data de publicação</code> e consistirão de uma{' '}
              <code>etiqueta</code>, um <code>título</code> e uma{' '}
              <code>descrição</code> .
            </p>
            <p>Tipos de etiqueta:</p>
            <ul className="space-y-1">
              <li>
                <Tag tag="Adicionado" />: Para novas funcionalidades.
              </li>
              <li>
                <Tag tag="Alterado" />: Para mudanças em funcionalidades já
                existentes.
              </li>
              <li>
                <Tag tag="Removido" />: Para funcionalidades removidas.
              </li>
              <li>
                <Tag tag="Corrigido" />: Para erros corigidos.
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    title: '2 de Agosto de 2024',
    subCards: [
      {
        title: 'Relatório de busca por radar',
        tag: 'Adicionado',
        content: (
          <>
            <p>
              No módulo <code>Mapas</code>, após uma consulta por radar, o botão
              que anteriormente fazia o download de um arquivo CSV com as
              detecções do radar agora gera um relatório em PDF sobre a
              consulta.
            </p>

            <span>O relatório inclui:</span>
            <ul>
              <li>
                Uma tabela de detecções, que agora também exibe a{' '}
                <code>velocidade do carro</code> no momento da detecção.
              </li>
              <li>
                Um cabeçalho com <code>título</code> e <code>ID</code>.
              </li>
              <li>
                Uma seção inicial contendo informações gerais da consulta e do
                radar, como <code>código</code>, <code>localização</code>,{' '}
                <code>sentido</code>, <code>período analisado</code>,{' '}
                <code>total de detecções</code>, etc.
              </li>
            </ul>

            <p>
              Caso a consulta resulte em zero detecções, o relatório ainda será
              gerado. Neste caso, em vez de uma tabela de detecções, o relatório
              conterá uma declaração informando que nenhum veículo foi detectado
              no período e radar selecionados.
            </p>
          </>
        ),
      },
      {
        title: 'Limite de intervalo de busca por radar',
        tag: 'Alterado',
        content: (
          <p>
            O intervalo de busca por radar foi ampliado. Anteriormente, era
            limitado a <code>20 minutos</code> (10 minutos para trás e 10
            minutos para frente da data selecionada). Agora, o limite foi
            aumentado para <code>2 horas</code> (1 hora para trás e 1 hora para
            frente da data selecionada).
          </p>
        ),
      },
    ],
  },
]
