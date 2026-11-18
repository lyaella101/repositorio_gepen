import { useEffect, useState } from "react";
import { buscarLista } from "../api.js";

// Carrega tipos, categorias e níveis para as listas suspensas.
export function useOpcoes() {
  const [opcoes, setOpcoes] = useState({ tipos: [], categorias: [], niveis: [] });
  const [erro, setErro] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    Promise.all([buscarLista("/tipos"), buscarLista("/categorias"), buscarLista("/niveis")])
      .then(([tipos, categorias, niveis]) => {
        if (ativo) setOpcoes({ tipos, categorias, niveis });
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregado(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return { ...opcoes, erro, carregado };
}

// Carrega as tags de uma categoria (vazio quando não há categoria).
export function useTagsDaCategoria(categoriaId) {
  const [estado, setEstado] = useState({ tags: [], carregando: false, erro: false });

  useEffect(() => {
    if (!categoriaId) {
      setEstado({ tags: [], carregando: false, erro: false });
      return;
    }
    let ativo = true;
    setEstado({ tags: [], carregando: true, erro: false });
    buscarLista(`/categorias/${categoriaId}/tags`)
      .then((tags) => {
        if (ativo) setEstado({ tags, carregando: false, erro: false });
      })
      .catch(() => {
        if (ativo) setEstado({ tags: [], carregando: false, erro: true });
      });
    return () => {
      ativo = false;
    };
  }, [categoriaId]);

  return estado;
}
