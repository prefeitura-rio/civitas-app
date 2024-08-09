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
