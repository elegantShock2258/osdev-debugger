// deno run --allow-net serialProxy.ts

const TCP_PORT = 4444;
const WS_PORT = 8080;

const clients = new Set<WebSocket>();

// Start WebSocket server
Deno.serve({ port: WS_PORT }, async (req) => {
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = () => {
    console.log("[WS] Client connected");
    clients.add(socket);
  };
  socket.onclose = () => {
    console.log("[WS] Client disconnected");
    clients.delete(socket);
  };
  return response;
});

// Start TCP server
const listener = Deno.listen({ port: TCP_PORT });
console.log(`✅ TCP server listening on port ${TCP_PORT}`);
console.log(`✅ WebSocket server listening on ws://localhost:${WS_PORT}`);

for await (const conn of listener) {
  console.log("[TCP] QEMU connected");
  handleTCP(conn).catch((err) => {
    console.error("[TCP] Error:", err);
  });
}

// 🔧 Buffer and parse |...| wrapped messages
async function handleTCP(conn: Deno.Conn) {
  const decoder = new TextDecoder();
  let textBuffer = ""; // Collects raw text between packets

  const buffer = new Uint8Array(1024);

  while (true) {
    const bytesRead = await conn.read(buffer);
    if (bytesRead === null) {
      console.log("[TCP] QEMU disconnected");
      break;
    }

    const chunk = decoder.decode(buffer.subarray(0, bytesRead));
    textBuffer += chunk;

    let start: number;
    let end: number;

    // Process all full |...| messages
    while (
      (start = textBuffer.indexOf("|")) !== -1 &&
      (end = textBuffer.indexOf("|", start + 1)) !== -1
    ) {
      const message = textBuffer.slice(start + 1, end);

      for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
          console.log(message);
        }
      }

      textBuffer = textBuffer.slice(end + 1);
    }
  }
}
