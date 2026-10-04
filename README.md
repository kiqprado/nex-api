# NeX API

Backend dedicado do NeX, com frontend Next.js mantido em projeto separado.

## Visão geral

A API utiliza Fastify, TypeScript, Zod, PostgreSQL e Prisma. Oferece cadastro e autenticação de usuários, além de criação e consulta de atividades esportivas e seus pontos de percurso.

O projeto está em desenvolvimento. Existem pendências de inicialização, validação de autenticação e configuração do ambiente. Os recursos descritos representam a implementação atual e ainda precisam de validação de ponta a ponta antes do uso em produção.

## Modelo de atividades

Workout representa uma atividade em execução; Activity representa o registro finalizado. Os pontos do percurso são associados à atividade. As categorias previstas são corrida, caminhada e trilha.

O backend armazena as métricas; o frontend é responsável por sua apresentação e formatação.

## Recursos

| Recurso | Descrição |
| --- | --- |
| Cadastro | Criação de conta com senha e dados de contato. |
| Login | Autenticação com identificador e senha. |
| Usuário atual | Consulta dos dados públicos da conta autenticada. |
| Logout | Encerramento da sessão no navegador. |
| Criação de atividades | Registro de métricas e pontos do percurso em uma transação. |
| Listagem de atividades | Consulta das atividades da conta autenticada. |
| Detalhe de atividade | Consulta de uma atividade e de seus pontos de percurso. |

As operações de atividades exigem autenticação e são vinculadas ao usuário da sessão. As respostas de autenticação não incluem hashes de senha.

## Dados de uma atividade

Uma atividade reúne identificador, datas de início e término, duração, distância, ritmo, velocidade, calorias, ganho de elevação, passos, categoria e percurso.

Os pontos do percurso podem conter coordenadas, altitude, precisão, velocidade, direção e instante de coleta. Esses dados podem revelar deslocamentos e locais frequentados; exemplos públicos devem utilizar dados fictícios.

O armazenamento de imagens do mapa ainda está pendente. A listagem de atividades também precisa de paginação.

## Desenvolvimento local

É necessário ter Node.js, npm e Docker disponíveis. O ambiente utiliza configuração local para conexão com o banco, autenticação e origem do frontend.

Credenciais e segredos devem ser definidos fora do código e não devem ser incluídos em documentação pública. Um arquivo de exemplo de configuração deve conter somente valores fictícios.

O fluxo de preparação inclui:

1. Instalar as dependências.
2. Iniciar o banco de dados local.
3. Configurar as variáveis de ambiente.
4. Conferir a compatibilidade do histórico de migrations antes de aplicá-las.
5. Gerar o cliente do banco de dados.
6. Cadastrar as categorias esportivas iniciais.
7. Resolver as pendências de inicialização e autenticação antes de executar e validar o fluxo completo.

Os comandos específicos de manutenção, detalhes de configuração e pendências técnicas devem ser consultados na documentação interna do projeto.
