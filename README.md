O sistema permite que um usuário registre o tempo que trabalhou em determinada atividade ou centro de custo em um dia específico, facilitando o controle de horas, organização das atividades e análise de produtividade.

Este projeto foi desenvolvido por mim durante meu estágio, sendo minha primeira experiência criando um sistema completo do zero, incluindo modelagem do banco de dados, criação da API e implementação das regras de negócio.

🎯 Objetivo

O principal objetivo do sistema é permitir que colaboradores registrem:

📅 Data do trabalho

⏱ Quantidade de horas trabalhadas 

👤 Usuário responsável

🏢 Centro de custo (CIF)

📝 Detalhes da atividade realizada

Essas informações ficam registradas no banco de dados e podem ser consultadas posteriormente para controle e análise.

⚙️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

Backend

☕ Java

🌱 Spring Boot

📦 Spring Data JPA

🔐 Hibernate

Banco de Dados

🗄 SQL Server

Ferramentas

🧪 Postman (testes da API)

🖥 Git / GitHub

🧠 IntelliJ / VSCode

📊 SQL Server Management Studio

🧠 Estrutura do Sistema

O sistema segue uma arquitetura baseada em API REST, organizada em camadas:

controller
service
repository
entity
dto
Controller

Responsável por receber as requisições HTTP.

Exemplos:

Criar apontamentos

Buscar registros

Filtrar por datas

Buscar por usuário ou centro de custo

Service

Camada responsável pela regra de negócio do sistema, como:

Verificação de dados

Controle de duplicidade

Criação de novos apontamentos

Validações

Repository

Responsável pela comunicação com o banco de dados utilizando Spring Data JPA.

Entity

Representação das tabelas do banco de dados.

Exemplo de entidades utilizadas:

Usuarios

DataApontamentos

Apontamentos

UsuarioCif

Cifs

🗂 Funcionamento do Sistema

O funcionamento ocorre em três etapas principais:

1️⃣ Criação da Data de Apontamento

O sistema registra um dia específico em que o usuário realizou atividades.

Exemplo:

Data: 2026-03-01
Usuário: 2
2️⃣ Registro do Apontamento

Depois disso, são registrados os apontamentos vinculados a essa data:

Centro de custo (CIF)

Tipo de atividade

Horas trabalhadas

Detalhes da atividade

Exemplo:

CIF: TI-Infraestrutura
Horas: 03:00
Detalhe: Manutenção de equipamentos
3️⃣ Consulta de Registros

O sistema também permite:

Buscar apontamentos por data

Buscar entre intervalos de datas

Buscar por usuário

Buscar por centro de custo

📡 Exemplos de Endpoints
Criar Apontamento
POST /apontamentos

Exemplo de JSON:

{
  "usuarioId": 2,
  "data": "2026-03-01",
  "cif": "TI01",
  "tipoId": 1,
  "horas": "02:30",
  "detalhe": "Suporte a infraestrutura"
}
Buscar entre Datas
GET /datas/entre-datas?dataInicio=2026-03-01T00:00:00&dataFim=2026-03-10T23:59:59
Buscar CIF
GET /cif?cif=TI
📊 Banco de Dados

O banco de dados foi modelado para permitir:

relacionamento entre usuários e centros de custo

registro de múltiplos apontamentos por dia

controle de exclusão lógica

integridade dos dados

Principais tabelas:

usuarios

apontamentos

data_apontamentos

usuario_cif

corpore_gccusto

🚀 Aprendizados com o Projeto

Durante o desenvolvimento deste sistema tive a oportunidade de aprender e praticar:

desenvolvimento de API REST com Spring Boot

modelagem de banco de dados relacional

uso de Hibernate e JPA

tratamento de erros e exceções

organização de código em arquitetura em camadas

versionamento de código com Git

Além disso, enfrentei diversos desafios técnicos que ajudaram muito no meu crescimento como desenvolvedor.

👨‍💻 Autor

Alan Dias

🎓 Estudante de Sistemas de Informação
💻 Interesse em desenvolvimento de software e tecnologia

Este projeto foi desenvolvido durante meu estágio como forma de resolver uma necessidade interna da empresa e também como experiência prática no desenvolvimento de sistemas.
