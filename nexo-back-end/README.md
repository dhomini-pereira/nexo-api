# Nexo — Back-end

API REST do aplicativo financeiro **Nexo**, construída com Fastify e PostgreSQL.

## Tecnologias

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify 5
- **Banco de dados:** PostgreSQL (Neon)
- **Autenticação:** JWT (access + refresh token rotation)
- **Hash de senhas:** bcryptjs
- **Injeção de dependência:** tsyringe
- **Push notifications:** expo-server-sdk
- **Deploy:** Vercel (Serverless)

## Estrutura do projeto

```
src/
├── app.ts                  # Configuração do Fastify (CORS, rotas, health check)
├── server.ts               # Entrypoint — inicializa o servidor
├── container.ts            # Registro de dependências (tsyringe)
├── config/
│   ├── database.ts         # Pool de conexão PostgreSQL
│   └── env.ts              # Variáveis de ambiente
├── database/
│   ├── schema.sql          # DDL completo do banco
│   └── migrate.ts          # Script de migração
├── entities/
│   └── index.ts            # Interfaces e DTOs
├── middlewares/
│   └── authMiddleware.ts   # Extrai e valida JWT no preHandler
├── repositories/           # Acesso ao banco (queries SQL)
│   ├── AccountRepository.ts
│   ├── CategoryRepository.ts
│   ├── CreditCardRepository.ts
│   ├── GoalRepository.ts
│   ├── InvestmentRepository.ts
│   ├── RefreshTokenRepository.ts
│   ├── TransactionRepository.ts
│   └── UserRepository.ts
├── routes/                 # Endpoints HTTP
│   ├── accounts.ts
│   ├── auth.ts
│   ├── categories.ts
│   ├── creditCards.ts
│   ├── cron.ts             # Vercel Cron — processa recorrências
│   ├── goals.ts
│   ├── investments.ts
│   ├── pushTokens.ts
│   └── transactions.ts
└── services/               # Regras de negócio
    ├── AccountService.ts
    ├── AuthService.ts
    ├── CategoryService.ts
    ├── CreditCardService.ts
    ├── GoalService.ts
    ├── InvestmentService.ts
    └── TransactionService.ts
```

## Variáveis de ambiente

| Variável             | Descrição                                      |
| -------------------- | ---------------------------------------------- |
| `DATABASE_URL`       | Connection string do PostgreSQL (Neon)          |
| `JWT_SECRET`         | Segredo para assinar access tokens              |
| `JWT_REFRESH_SECRET` | Segredo para assinar refresh tokens             |
| `CRON_SECRET`        | Token de autorização para o endpoint de cron    |
| `PORT`               | Porta do servidor (padrão: 3333)                |

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar migrations
npm run migrate

# Iniciar em modo desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build
npm start
```

## Endpoints principais

| Método | Rota                                   | Descrição                          |
| ------ | -------------------------------------- | ---------------------------------- |
| POST   | `/auth/register`                       | Cadastro de usuário                |
| POST   | `/auth/login`                          | Login                              |
| POST   | `/auth/refresh`                        | Renovação de tokens                |
| POST   | `/auth/logout`                         | Logout                             |
| GET    | `/auth/me`                             | Dados do usuário autenticado       |
| PUT    | `/auth/profile`                        | Atualizar perfil                   |
| GET    | `/accounts`                            | Listar contas                      |
| POST   | `/accounts`                            | Criar conta                        |
| PUT    | `/accounts/:id`                        | Atualizar conta                    |
| DELETE | `/accounts/:id`                        | Excluir conta                      |
| GET    | `/transactions`                        | Listar transações                  |
| POST   | `/transactions`                        | Criar transação                    |
| PUT    | `/transactions/:id`                    | Atualizar transação                |
| DELETE | `/transactions/:id`                    | Excluir transação                  |
| POST   | `/transfers`                           | Transferência entre contas         |
| GET    | `/transactions/:id/children`           | Filhas de uma recorrência          |
| PUT    | `/transactions/:id/pause`              | Pausar/despausar recorrência       |
| DELETE | `/transactions/:id/recurrence`         | Excluir recorrência + histórico    |
| GET    | `/categories`                          | Listar categorias                  |
| POST   | `/categories`                          | Criar categoria                    |
| PUT    | `/categories/:id`                      | Atualizar categoria                |
| DELETE | `/categories/:id`                      | Excluir categoria                  |
| GET    | `/investments`                         | Listar investimentos               |
| POST   | `/investments`                         | Criar investimento                 |
| PUT    | `/investments/:id`                     | Atualizar investimento             |
| DELETE | `/investments/:id`                     | Excluir investimento               |
| GET    | `/goals`                               | Listar metas                       |
| POST   | `/goals`                               | Criar meta                         |
| PUT    | `/goals/:id`                           | Atualizar meta                     |
| DELETE | `/goals/:id`                           | Excluir meta                       |
| GET    | `/credit-cards`                        | Listar cartões de crédito          |
| POST   | `/credit-cards`                        | Criar cartão                       |
| PUT    | `/credit-cards/:id`                    | Atualizar cartão                   |
| DELETE | `/credit-cards/:id`                    | Excluir cartão                     |
| GET    | `/credit-cards/:id/invoices`           | Faturas de um cartão               |
| POST   | `/credit-cards/invoices/:invoiceId/pay`| Pagar fatura                       |
| POST   | `/push-token`                          | Registrar push token               |
| DELETE | `/push-token`                          | Remover push token                 |
| GET    | `/api/cron/recurrences`                | Processar recorrências (Vercel Cron)|
| GET    | `/health`                              | Health check                       |
