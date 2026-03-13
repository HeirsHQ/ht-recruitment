import type { PersistOptions } from "zustand/middleware";
import type { StateCreator } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { create } from "zustand/react";

import { reportException } from "./report";

export const createPersistMiddleware = <T>(
  name: string,
  storeCreator: StateCreator<T>,
  options?: Omit<PersistOptions<T>, "name">,
) => create<T>(reportException<T>(persist(storeCreator, { name: name || "z:root", ...options }) as StateCreator<T>));
