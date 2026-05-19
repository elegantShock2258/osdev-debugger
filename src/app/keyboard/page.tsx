"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./keyboard.module.sass";
import Log from "@/components/Log/Log";
import { parseLogEntries } from "../server/actions/parser";

export default function Page() {
  const keyboardRef = useRef<{ [scancode: string]: number }>({});
  const decoder = new TextDecoder();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.binaryType = "arraybuffer";

    socket.onmessage = async (e) => {
      const parsedMessage = parseLogEntries(e.data);
      if (parsedMessage?.type === "keyboard") {
        if (!(parsedMessage.scancode in keyboardRef.current)) {
          keyboardRef.current[parsedMessage.scancode] = 0;
        }
        keyboardRef.current[parsedMessage.scancode]++;
      }
      return () => socket.close();
    };
  }, []);
  return (
    <div className={styles.logcat}>
      {/* {logs.map((log, i) => { */}
      {/* return <Log log={log} key={i} />; */}
      {/* })} */}
    </div>
  );
}
