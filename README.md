# Nexo

Aplicativo de controle financeiro pessoal completo, com back-end em Fastify e front-end mobile em React Native + Expo.

## Visão geral

O **Nexo** permite gerenciar contas bancárias, transações, cartões de crédito, investimentos e metas financeiras em um único lugar, com gráficos interativos, modo privacidade e autenticação biométrica.

## Arquitetura

```
financial-app/
├── nexo-back-end/    # API REST (Fastify + PostgreSQL)
├── mobile/           # App mobile (React Native + Expo SDK 54)
└── .github/          # CI/CD
```

## Stack

| Camada    | Tecnologias                                                        |
| --------- | ------------------------------------------------------------------ |
| Back-end  | Node.js, TypeScript, Fastify 5, PostgreSQL (Neon), tsyringe, JWT   |
| Mobile    | React Native 0.81, Expo SDK 54, Zustand, react-native-svg          |
| Deploy    | Vercel (API) + Expo (mobile)                                       |

## Funcionalidades

- Contas bancárias com saldo em tempo real
- Transações com categorias, filtros e busca
- Cartões de crédito com faturas, parcelas e controle de limite
- Transferências entre contas
- Recorrências automáticas (daily, weekly, monthly, yearly)
- Metas financeiras com progresso visual
- Investimentos com acompanhamento
- Gráficos interativos com filtros de período
- Modo privacidade (oculta valores)
- Tema claro e escuro
- Autenticação biométrica (Face ID / Fingerprint)
- Push notifications para recorrências processadas
- Refresh token rotation com sessão de 30 dias

## Como rodar

### Back-end

```bash
cd nexo-back-end
npm install
npm run migrate
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npm start
```

Consulte os READMEs individuais de cada projeto para mais detalhes:

- [Back-end](nexo-back-end/README.md)
- [Mobile](mobile/README.md)
