import { registerProvider } from "@/providers/_core/registry";

import { remoteProvider } from "./adapter";

registerProvider(remoteProvider);
