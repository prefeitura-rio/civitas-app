# Histórico de Atualizações
Este documento registra todas as alterações do projeto CIVITAS perceptíveis ao usuário final.

## [v1.0.0] - 02/08/2024

### Adicionado:

* **Relatório de busca por radar**
  
  No módulo `Mapas`, após uma consulta por radar, o botão que anteriormente fazia o download de um arquivo CSV com as detecções do radar agora gera um relatório em PDF sobre a consulta.

  O relatório inclui:

  * Uma tabela de detecções, que agora também exibe a `velocidade do carro` no momento da detecção.
  * Um cabeçalho com `título` e `ID`.
  * Uma seção inicial contendo informações gerais da consulta e do radar, como `código`, `localização`, `sentido`, `período analisado`, `total de detecções`, etc.

  Caso a consulta resulte em zero detecções, o relatório ainda será gerado. Neste caso, em vez de uma tabela de detecções, o relatório conterá uma declaração informando que nenhum veículo foi detectado no período e radar selecionados.


### Alterado:
* ### Limite de intervalo de busca por radar

  O intervalo de busca por radar foi ampliado. Anteriormente, era limitado a 20 minutos (10 minutos para trás e 10 minutos para frente da data selecionada). Agora, o limite foi aumentado para 2 horas (1 hora para trás e 1 hora para frente da data selecionada).