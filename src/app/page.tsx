"use client";

import { useEffect, useRef, useState } from "react";
import { parseLogEntries } from "./server/actions/parser";
import styles from "./home.module.sass";
import Log from "@/components/Log/Log";

export default function Page() {
  const bufferRef = useRef<string>("");
  const decoder = new TextDecoder();
  const [refresh, setRefresh] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.binaryType = "arraybuffer";

    socket.onmessage = async (e) => {
      const parsedMessage = parseLogEntries(e.data);
      if (parsedMessage?.type === "message") {
        const y = [...logs, parsedMessage.message];
        console.log(e.data);
        setLogs(y);
      }
      return () => socket.close();
    };
  }, [logs]);
  return (
    <div className={styles.logcat}>
      {refresh && <></>}
      {logs.map((log, i) => {
        return <Log log={log} key={i} />;
      })}
    </div>
  );
}
