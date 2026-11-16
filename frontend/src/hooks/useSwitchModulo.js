import { useCallback, useEffect, useState } from "react";
import { getSwitches, setTalleresHabilitado } from "../services/switchModulo.services.js";

let estado = { cargado: false, talleres_habilitado: true };
let promesa = null;
const oyentes = new Set();

const publicar = (nuevo) => {
  estado = { ...estado, ...nuevo };
  oyentes.forEach((fn) => fn(estado));
};

const cargar = () => {
  if (!promesa) {
    promesa = getSwitches()
      .then((a) => publicar({ cargado: true, talleres_habilitado: a.talleres_habilitado !== false }))
      .catch(() => publicar({ cargado: true }))
      .finally(() => {
        promesa = null;
      });
  }
  return promesa;
};

export default function useSwitchModulo() {
  const [valor, setValor] = useState(estado);

  useEffect(() => {
    oyentes.add(setValor);
    setValor(estado);
    if (!estado.cargado) cargar();
    return () => oyentes.delete(setValor);
  }, []);

  const cambiarTalleres = useCallback(async (habilitado) => {
    const r = await setTalleresHabilitado(habilitado);
    publicar({ talleres_habilitado: r.talleres_habilitado });
    return r;
  }, []);

  return { cargado: valor.cargado, talleresHabilitado: valor.talleres_habilitado, cambiarTalleres };
}
