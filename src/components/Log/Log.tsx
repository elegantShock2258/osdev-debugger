import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import styles from "./Log.module.sass";

export default function Log({ log, ...props }: { log: string }) {
  return (
    <Alert {...props}>
      <AlertTitle>Log</AlertTitle> {/*TODO: set up log levels*/}
      <AlertDescription className={styles.log}>{log}</AlertDescription>
    </Alert>
  );
}
