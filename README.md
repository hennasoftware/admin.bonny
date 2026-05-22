# bonny-system

Sistema interno para gestao de adocao de animais em ONGs, organizado no fluxo **animal -> interessado -> adocao**.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firestore

## Proposito

Centralizar o controle de animais, adotantes e processos de adocao, substituindo planilhas e fluxos manuais por uma aplicacao escalavel.

## Funcionalidades atuais

- Cadastro e login com Firebase Authentication
- Fluxo de aprovacao de acesso para novos usuarios
- Cargos de `Administrador` e `Colaborador`
- Rotas protegidas por autenticacao, aprovacao e permissao administrativa
- Dashboard com indicadores, grafico mensal, busca global e central de atualizacoes
- Modulos de animais, adotantes e adocoes com cadastro, edicao e exclusao
- Auditoria administrativa com logs filtraveis por usuario, modulo e acao
- Alternancia entre tema claro e escuro

## Execucao local

```bash
npm install
npm run dev
```

## Sistema de atualizacoes

O Bonny possui uma central interna de atualizacoes exibida no dashboard para comunicar novas releases a equipe.

- Os dados sao definidos em `src/modules/dashboard/systemUpdatesSeedData.ts`
- A publicacao no Firestore e feita pela tela protegida `__internal/system-updates-sync-9x4k`
- Cada release registra versao, titulo, resumo, destaques, areas impactadas e observacoes operacionais

### Release 1.4.0

- Novo controle de acesso com solicitacao de cadastro e aprovacao administrativa
- Separacao entre contas `Administrador` e `Colaborador`
- Tela administrativa para aprovacao de usuarios e definicao de cargo
- Tela administrativa de logs com filtros e paginacao
- Auditoria de criacao, edicao e exclusao nos modulos principais

## Proximos passos do produto

- Refinar mais fluxos administrativos e dashboards operacionais
- Expandir a cobertura de testes para os cenarios de aprovacao, logs e permissoes
- Evoluir o historico de atualizacoes com mais automacao de publicacao
