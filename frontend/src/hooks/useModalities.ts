import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Modality } from "../types";

export function useModalities() {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.modalities
      .list()
      .then(setModalities)
      .catch(() => setError("Falha ao carregar modalidades."))
      .finally(() => setLoading(false));
  }, []);

  return { modalities, loading, error };
}
