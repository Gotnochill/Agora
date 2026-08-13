# Self-Hosted Chat Gateway

ShardUp chat uses PostgreSQL as a transient store-and-forward inbox. The gateway only forwards
committed messages to currently connected browsers; it never stores message content. If the
gateway is stopped or restarted, clients reconnect and recover their pending messages from the
database.

Redis is intentionally not required for the first deployment. A single gateway process keeps a
`userId -> WebSocket connections` map in memory. Add Redis Pub/Sub only when running more than one
gateway replica, so a publish received by one replica can reach sockets connected to another.

## Local Development

Add the chat variables from `.env.example` to `.env.local`, then run the app and gateway in separate
terminals:

```bash
npm run dev
npm run chat:gateway
```

Use two browser profiles and the development member/admin accounts to test delivery. When the
gateway is not running, chat still works through the 15-second pending-inbox recovery loop.

## Oracle VM Deployment

The gateway can run beside the existing Piston deployment as an isolated Node 20 container. Copy
`infra/chat-gateway.mjs`, `infra/chat-gateway.Dockerfile`, and
`infra/chat-gateway-compose.yaml` into `/opt/shardup-chat/infra`, then build it:

```bash
cd /opt/shardup-chat
docker compose -f infra/chat-gateway-compose.yaml up -d --build
```

Create `/etc/shardup-chat.env` with permissions `0600`:

```text
CHAT_GATEWAY_PORT=8787
CHAT_REALTIME_TOKEN_SECRET=<random-token-secret>
CHAT_REALTIME_PUBLISH_SECRET=<different-random-publish-secret>
CHAT_ALLOWED_ORIGINS=https://YOUR_SHARDUP_DOMAIN
```

Add a path handler before the existing judge authorization handler:

```caddy
YOUR_VM_DOMAIN {
  handle_path /chat/* {
    reverse_proxy 127.0.0.1:8787
  }

  # Existing judge handlers continue below this route.
}
```

Only ports 80/443 should be public; do not expose port 8787 through the Oracle security list.

Set these variables in Vercel and redeploy:

```text
CHAT_REALTIME_TOKEN_SECRET=<same token secret as gateway>
CHAT_REALTIME_PUBLISH_SECRET=<same publish secret as gateway>
CHAT_REALTIME_INTERNAL_URL=https://YOUR_VM_DOMAIN/chat
NEXT_PUBLIC_CHAT_WS_URL=wss://YOUR_VM_DOMAIN/chat/socket
CRON_SECRET=<another random secret>
```

`CHAT_REALTIME_PUBLISH_SECRET` protects the server-only `/publish` endpoint. Browsers receive only a
short-lived, user-bound connection token. The gateway rejects all client-originated message frames.

## Operations

- Health: `GET https://YOUR_VM_DOMAIN/chat/health`
- Logs: `docker logs -f shardup_chat_gateway`
- Restart: `docker restart shardup_chat_gateway`
- Rotate both chat secrets in the gateway and Vercel together.
- Pending messages expire after 30 days. Delivered message payloads are deleted after browser
  IndexedDB persistence and acknowledgement.