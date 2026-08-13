import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { jwtVerify } from "jose";
import { WebSocket, WebSocketServer } from "ws";

const port = Number(process.env.CHAT_GATEWAY_PORT ?? 8787);
const publishSecret = process.env.CHAT_REALTIME_PUBLISH_SECRET;
const tokenSecret = process.env.CHAT_REALTIME_TOKEN_SECRET ?? process.env.AUTH_SECRET;
const allowedOrigins = new Set(
  (process.env.CHAT_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const socketsByUser = new Map();
const encoder = new TextEncoder();

if (!publishSecret || !tokenSecret) {
  throw new Error("CHAT_REALTIME_PUBLISH_SECRET and CHAT_REALTIME_TOKEN_SECRET are required");
}

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}

function safeSecretMatch(value, expected) {
  const actualBuffer = Buffer.from(value ?? "");
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 128 * 1024) {
        reject(new Error("Payload too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function validPublish(body) {
  return (
    body &&
    Array.isArray(body.recipientIds) &&
    body.recipientIds.length > 0 &&
    body.recipientIds.length <= 20 &&
    body.recipientIds.every((id) => typeof id === "string" && id.length > 0 && id.length <= 128) &&
    body.envelope &&
    typeof body.envelope.id === "string" &&
    typeof body.envelope.body === "string" &&
    body.envelope.body.length <= 4000
  );
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    json(response, 200, {
      ok: true,
      users: socketsByUser.size,
      connections: Array.from(socketsByUser.values()).reduce(
        (total, sockets) => total + sockets.size,
        0,
      ),
    });
    return;
  }

  if (request.method !== "POST" || url.pathname !== "/publish") {
    json(response, 404, { error: "Not found" });
    return;
  }

  const authorization = request.headers.authorization;
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!safeSecretMatch(bearer, publishSecret)) {
    json(response, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const body = await readJson(request);
    if (!validPublish(body)) {
      json(response, 400, { error: "Invalid publish payload" });
      return;
    }

    const payload = JSON.stringify({ type: "message", envelope: body.envelope });
    let delivered = 0;
    for (const recipientId of new Set(body.recipientIds)) {
      for (const socket of socketsByUser.get(recipientId) ?? []) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(payload);
          delivered += 1;
        }
      }
    }

    json(response, 200, { delivered });
  } catch (error) {
    json(response, 400, { error: error instanceof Error ? error.message : "Invalid request" });
  }
});

const webSocketServer = new WebSocketServer({
  noServer: true,
  maxPayload: 1024,
  handleProtocols(protocols) {
    return protocols.has("shardup-chat") ? "shardup-chat" : false;
  },
});

server.on("upgrade", async (request, socket, head) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const origin = request.headers.origin;
    const protocols = (request.headers["sec-websocket-protocol"] ?? "")
      .split(",")
      .map((protocol) => protocol.trim());
    const token = protocols.find((protocol) => protocol !== "shardup-chat");

    if (
      url.pathname !== "/socket" ||
      !protocols.includes("shardup-chat") ||
      !token ||
      (allowedOrigins.size > 0 && (!origin || !allowedOrigins.has(origin)))
    ) {
      socket.destroy();
      return;
    }

    const { payload } = await jwtVerify(token, encoder.encode(tokenSecret), {
      algorithms: ["HS256"],
      issuer: "shardup-web",
      audience: "shardup-chat-gateway",
    });

    if (payload.scope !== "chat:connect" || typeof payload.sub !== "string") {
      socket.destroy();
      return;
    }

    request.chatUserId = payload.sub;
    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      webSocketServer.emit("connection", webSocket, request);
    });
  } catch {
    socket.destroy();
  }
});

webSocketServer.on("connection", (socket, request) => {
  const userId = request.chatUserId;
  const userSockets = socketsByUser.get(userId) ?? new Set();
  socket.isAlive = true;
  userSockets.add(socket);
  socketsByUser.set(userId, userSockets);

  socket.on("pong", () => {
    socket.isAlive = true;
  });
  socket.on("message", () => {
    socket.close(1008, "Client publishing is not allowed");
  });
  socket.on("close", () => {
    userSockets.delete(socket);
    if (userSockets.size === 0) socketsByUser.delete(userId);
  });
});

const heartbeat = setInterval(() => {
  for (const socket of webSocketServer.clients) {
    if (!socket.isAlive) {
      socket.terminate();
      continue;
    }
    socket.isAlive = false;
    socket.ping();
  }
}, 30_000);

server.on("close", () => clearInterval(heartbeat));
server.listen(port, "0.0.0.0", () => {
  console.log(`ShardUp chat gateway listening on :${port}`);
});
