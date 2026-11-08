// Relay service for "2 Truths & a Lie": hands out fresh, short-lived TURN relay details from Cloudflare.
//
// Set up (Cloudflare dashboard):
//   1. Realtime → TURN Server → Create a TURN key. Note the "Turn Token ID" and the "API Token".
//   2. Workers & Pages → Create → Worker. Replace the code with this file and deploy.
//   3. In the Worker: Settings → Variables and Secrets, add three secrets:
//        TURN_KEY_ID        the Turn Token ID from step 1
//        TURN_KEY_API_TOKEN the API Token from step 1
//        ACCESS_CODE        a password of your own choosing (letters and numbers)
//   4. Put the Worker's address and your ACCESS_CODE in a private copy of the projector page
//      (RELAY_URL and RELAY_KEY). Never put them, or these secrets, in a public repository.
//
// The game asks:  GET <worker address>?key=<ACCESS_CODE>
// and gets back:  { "iceServers": [ ... ] }   (valid for 24 hours)

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const key = new URL(request.url).searchParams.get("key");
    if (!env.ACCESS_CODE || key !== env.ACCESS_CODE) {
      return new Response(JSON.stringify({ error: "wrong access code" }), { status: 403, headers: cors });
    }

    const base = `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials`;
    const ask = (path) => fetch(`${base}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl: 86400 }),
    });

    // Cloudflare has two versions of this call; use whichever this account supports.
    let res = await ask("generate-ice-servers");
    if (res.status === 404) res = await ask("generate");
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Cloudflare said ${res.status}` }), { status: 502, headers: cors });
    }
    const data = await res.json();
    const iceServers = [].concat(data.iceServers || []);   // one object or a list: always return a list
    return new Response(JSON.stringify({ iceServers }), { headers: cors });
  },
};
