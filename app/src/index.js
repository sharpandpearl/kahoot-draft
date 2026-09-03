import PAGE from "./page.html";
export { Game } from "./game.js";

// One game, one room. A single Durable Object instance holds all state.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const id = env.GAME.idFromName("draft-2026");
      return env.GAME.get(id).fetch(request);
    }

    return new Response(PAGE, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
};
