# CIVITAS - Central de Vigilância, Inteligência e Tecnologia de apoio à Segurança Pública
- Responsável de Infraestrutura: Gabriel Milan (IPLANRIO)
- Responsável pelo Frontend: Victor Assis (IPLANRIO)

## O que é o CIVITAS?
- O CIVITAS tem como objetivo primário apoiar as forças de segurança no combate a atividades irregulares ou ilegais de forma inteligente e coordenada.
- O CIVITAS conta com mais de 1.500 radares da CET-Rio e mais de 2.800 câmeras do Centro de Operações Rio (COR) espahados por todas as zonas da cidade, além de dados do Disque Denúnica e outras fontes diversas.
- A plataforma visa disponibilizar acesso a todos esses dados da melhor forma possível, oferencendo ferramentas de busca, visualização interativa, e geração de relatórios automatizados. Tudo para facilidar o trabalho de inteligência das forças de segurança.

## O Sistema
- O CIVITAS possui três componentes:
  - API (desenvolvida em Fast API, Python 3.11);
  - Banco de Dados (PostgreSQL); e
  - Frontend (Next.js 14).

## Preparação de Ambiente
1. Comece rodando `pnpm i` na raiz do projeto.
2. Crie um arquivo  `.env.local` na raiz do projeto utilizando como exemplo o arquivo `.env.example`.
  
    O único secret necessário é o referente à api do [mapbox](https://www.mapbox.com/). Peça o access token do mapbox para um administrador do sistema.
3. Inicie a aplicação rodando `pnpm run dev`

## Scripts úteis
- `type-check`: Lista erros de typescript em todo o projeto
- `lint:fix`: Lista erros de lint

