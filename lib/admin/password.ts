import "server-only";
import { randomBytes } from "node:crypto";

/** Temporary password shown once to the admin who creates or resets an account. */
export const tempPassword = () => randomBytes(12).toString("base64url");
