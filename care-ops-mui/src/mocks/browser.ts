import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Browser worker (dev only). Started in index.tsx before the app mounts.
export const worker = setupWorker(...handlers);
