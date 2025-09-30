# Indíce
- [Padrões de Branch](#padrôes-de-branch)
- [Mensagens de commit](#mensagens-de-commit)
- [Padrão de nomeação](#padrão-de-nomeação)
- [Workflow](#workflow)

--- 

## Padrões de branch
- O padrão de branch a ser seguido é lowercase_snake_case.
- A branch main é protegida, então somente pull requests para main poderão atualizá-la.

- Teremos dois padrões de branches (baseado na estratégia de branches Git Flow):
    - Branches principais:
        - Main: histórico oficial, deve estar sempre estável
        - Develop: branch principal de integração com todas as features concluídas

    - Branches de apoio:
        - Feature: serve para desenvolver uma nova funcionalidade
        - Hotfix: serve para corrigir bugs críticos


---

## Mensagens de commit
Formato: <tipo>: <descrição>

- Tipos utilizados:
    - feat: para novas funcionalidade
    - fix: para correções de bugs
    - doc: para mudanças na documentação
    - style: para mudanças na formatação
    - refactor: para refatorar o código (não alterando o comportamento externo)
    - test: para adição ou correção de testes
    - chore: para mudanças no processo de build

Breaking changes: para commits que introduzem alguma mudança incompatível. Nesses casos colocar um "!" após o tipo. Exemplo: "feat!: corrigir erro de validação"

---

## Padrão de nomeação

Para padronizar o projeto favor utilizarem somente snake_case e CamelCase tanto no frontend quanto no backend

- Será utilizado lowercase_snake_case para:

    - Estrutura do código
    - Funções
    - Variáveis
    - Nomes de pastas e de arquivos

- Usar CamelCase apenas em nomes de classes. 

Para a linguagem do projeto será utilizado o inglês

---

## Workflow
- Verificar issues disponíveis no repositório (Projects)
- Ao terminar não esqueça de criar o pull request.
