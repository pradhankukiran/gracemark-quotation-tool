/**
 * Structured error type that adapters and provider clients throw so the
 * fan-out layer can classify outcomes without parsing message strings.
 */

export type ProviderErrorKind =
  | "unsupported"
  | "invalid_input"
  | "upstream"
  | "unknown";

export interface ProviderErrorInit {
  kind: ProviderErrorKind;
  status?: number;
  cause?: unknown;
  message?: string;
}

export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;
  readonly status?: number;
  override readonly cause?: unknown;

  constructor(init: ProviderErrorInit) {
    super(init.message ?? init.kind);
    this.name = "ProviderError";
    this.kind = init.kind;
    this.status = init.status;
    this.cause = init.cause;
  }
}
