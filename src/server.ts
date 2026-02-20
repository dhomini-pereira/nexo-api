import "reflect-metadata";
import { buildApp } from "./app";
import { env } from "./config/env";
import type { FastifyInstance } from "fastify";
import type { IncomingMessage, ServerResponse } from "http";

let app: FastifyInstance | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  return app;
}

// ---------------------------------------------------------------------------
// Vercel Serverless Handler
// ---------------------------------------------------------------------------
// When deployed on Vercel, the VERCEL env var is automatically set.
// @vercel/node imports this default export and calls it for every request.
// By awaiting `getApp()` we guarantee that ALL Fastify plugins (including
// creditCardRoutes and every other route file) are fully registered before
// the first request is ever processed — eliminating the race-condition that
// caused "Route POST:/credit-cards not found".
// ---------------------------------------------------------------------------
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const fastify = await getApp();
  fastify.server.emit("request", req, res);
}

// ---------------------------------------------------------------------------
// Local development — only starts a listening TCP server when NOT on Vercel
// ---------------------------------------------------------------------------
if (!process.env.VERCEL) {
  (async () => {
    const fastify = await buildApp();

    try {
      await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  })();
}
