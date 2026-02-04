import { getActiveExceptionDefinitions } from "@/services/exception.service.mock";
import { ExceptionDefinition } from "@/types/exception";
import React from "react";

/** ดึง ExceptionDefinitions ที่ Active เพื่อใช้เป็น checkbox */
export function useActiveExceptionDefinitions() {
  const [defs, setDefs] = React.useState<ExceptionDefinition[]>([]);
  const [isLoading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    getActiveExceptionDefinitions(ac.signal)
      .then((list) => setDefs(list))
      .catch((e) => {
        if (e?.name !== "AbortError") console.error(e);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  return { defs, isLoading };
}