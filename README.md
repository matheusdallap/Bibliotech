# Bibliotech

# Índice
- [Objetivo](#objetivo)  
- [Tecnologias utilizadas](#tecnologias-utilizadas)  
- [Primeiros passos](#primeiros-passos)  

---

## Objetivo
Esse repositório tem como objetivo o desenvolvimento do projeto colaborativo com o nome **Bibliotech**, proposto na disciplina de **Engenharia de Software do curso de Ciência da Computação da UTFPR**.

Bibliotech é um sistema de visualização e empréstimo de livros, utilizando uma base de dados (ainda em decisão) para catalogação dos livros presentes no sistema. O foco do projeto é fornecer uma interface amigável e uma funcionalidade sistemática apresentável para o funcionamento do sistema. A aplicação também conta com a aba comunidade para que os usuários leitores tenham um ambiente virtual para discussão entre ele, oferecendo uma forma de integração rápida e confortável aos usuários. Esse recurso pode ser aplicado em cenários de bibliotecas que estejam precisando de um aprimoramento em seu ambiente virtual, oferencendo novas implementações, como aba comunidade, catalogação dos livros, empréstimo virtual, aplicação portátil, e até mesmo aprimoramento no marketing.

## Funcionalidades

1. **Autenticação e Perfis**
    - Login, registro e gerenciamento de perfil via JWT.
    - Níveis de acesso: Usuário Leitor e Administrador (Bibliotecário)

2. **Gerenciamento de Acervo**
    - Cadastro de livros com capa, autor, editora e estoque.
    - Visualização de livros em vitrine (Dashboard).
    - Sistema de busca e filtros.

3. **Sistema de Empréstimos**
    - Solicitação de empréstimo (com verificação de estoque e limites).
    - Devolução de livros.
    - Histórico de empréstimos do usuário.
    - Regras de negócio automatizadas (ex: limite de 5 livros por usuário).

4. **Comunidade e Interação**
    - Avaliação de livros (Rating de 1 a 5 estrelas).
    - Comentários e resenhas nas obras.
    - Favoritar livros.

5. **Dashboard Interativo**

    - Livros sendo mostrados em forma de card.
    - Visualização de livros emprestados ao usuário, com data prevista de expiração.
    - Limitação de empréstimos por usuário.

---


## Tecnologias utilizadas
O projeto foi desenvolvido utilizando as seguintes tecnologias:

- Backend: Django com REST Framework (Python)
- Frontend: Next.js
- Banco de Dados: PostgreSQL
- Infraestrutura: Docker & Docker Compose

---

## Primeiros passos
O projeto foi configurado para ser **"Plug-and-Play"**. O ambiente de desenvolvimento (Banco de Dados, Backend e Frontend) é levantado automaticamente com um único comando.

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose instalados.

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/matheusdallap/Bibliotech.git
   cd Bibliotech
   ```

2. **Configure as Variáveis de Ambiente:**
Copie o arquivo do exemplo para criar seu .env:
   ```bash
    # Linux / Mac
    cp .env.example .env

    # Windows (PowerShell)
    copy .env.example .env
   ```

3. **Suba o Ambiente:**
Execute o comando abaixo para construir e iniciar os containers:
    ```bash
    docker compose up --build
    ```

### Acessando a Aplicação
Após o terminal indicar que o servidor iniciou:
- Frontend (Usuário): http://localhost:3000
- API (Backend): http://localhost:8000
- Painel Administrativo da API: http://localhost:8000/admin

Credenciais Padrão (ADMIN) para o Painel Administrativo:
- Usuário: admin
- Senha: admin

Credenciais Padrão (ADMIN) para o Frontend:
- Usuário: admin@bibliotech.com
- Senha: admin

---

## Estrutura do Projeto

```
Bibliotech/
├── docker-compose.yml    # Orquestração dos containers
├── .env                  # Variáveis de ambiente
├── frontend/             # Aplicação Next.js
└── rest_api/             # Aplicação Django
    ├── books/            # App de Livros
    ├── loans/            # App de Empréstimos
    ├── client/           # App de Usuários
    ├── entrypoint.py     # Script de automação de inicialização
    └── manage.py
```