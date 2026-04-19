import { useEffect, useRef } from "react";
import { LogEntry } from "../../types/game";

interface BattleLogProps {
  logs: LogEntry[];
}

export default function BattleLog({ logs }: BattleLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <h3 style={{ fontSize: "0.9rem", marginBottom: 8, color: "var(--text-secondary)" }}>
        Battle Log
      </h3>
      <div className="game-log" ref={logRef}>
        {logs.slice(-30).map((log, i) => (
          <div key={i} className="log-entry">{log.message}</div>
        ))}
      </div>
    </div>
  );
}
