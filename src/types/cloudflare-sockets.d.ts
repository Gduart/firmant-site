declare module "cloudflare:sockets" {
  type SocketOptions = {
    secureTransport?: "off" | "on" | "starttls";
    allowHalfOpen?: boolean;
  };

  type SocketAddress = {
    hostname: string;
    port: number;
  };

  type Socket = {
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
    opened: Promise<unknown>;
    closed: Promise<void>;
    close(): Promise<void>;
    startTls(): Socket;
  };

  export function connect(
    address: string | SocketAddress,
    options?: SocketOptions,
  ): Socket;
}

