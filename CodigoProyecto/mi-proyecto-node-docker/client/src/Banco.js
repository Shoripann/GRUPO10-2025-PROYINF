import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Banco() {
  const [asignatura, setAsignatura] = useState('');
  const [cargando, setCargando] = useState(false);
  const [pregs, setPregs] = useState([]);
  const [seleccion, setSeleccion] = useState({}); 
  const cargar = async () => {
    if (!asignatura) {
      setPregs([]);
      return;
    }
    setCargando(true);
    try {
      const res = await axios.get(`/api/preguntas/banco/${encodeURIComponent(asignatura)}`);
      setPregs(res.data || []);
      setSeleccion({});
    } catch (e) {
      console.error(e);
      alert('Error cargando banco');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { if (asignatura) cargar(); }, [asignatura]);

  const marcar = (pregId, idx) => {
    setSeleccion(prev => ({ ...prev, [pregId]: idx }));
  };

  const contar = () => {
    let ok = 0;
    pregs.forEach(p => {
      const correctaIdx = p.opciones.findIndex(o => o.esCorrecta === true);
      if (seleccion[p.id] === correctaIdx) ok++;
    });
    return { ok, total: pregs.length, pct: pregs.length ? (ok * 100 / pregs.length) : 0 };
  };

  const stats = contar();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Banco de Preguntas</h1>

      <label className="block mb-2">Selecciona asignatura</label>
      <select
        className="input mb-4"
        value={asignatura}
        onChange={(e) => setAsignatura(e.target.value)}
      >
        <option value="">-- Seleccionar --</option>
        <option value="Matemáticas">Matemáticas</option>
        <option value="Lenguaje">Lenguaje</option>
        <option value="Biología">Biología</option>
        <option value="Física">Física</option>
        <option value="Química">Química</option>
        <option value="Historia">Historia</option>
      </select>

      {cargando && <p>Cargando...</p>}

      {!cargando && asignatura && pregs.length === 0 && (
        <p className="text-gray-500">No hay preguntas en el banco para esta asignatura.</p>
      )}

      {pregs.map((p, i) => {
        const sel = seleccion[p.id];
        const correctaIdx = p.opciones.findIndex(o => o.esCorrecta === true);
        const correcto = sel != null && sel === correctaIdx;
        const respondida = sel != null;

        return (
          <div key={p.id} className="bg-white rounded shadow p-4 mb-4">
            <div className="font-medium mb-2">{i + 1}. {p.texto}</div>
            <div className="space-y-2">
              {p.opciones.map((o, idx) => (
                <label key={o.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`preg-${p.id}`}
                    checked={sel === idx}
                    onChange={() => marcar(p.id, idx)}
                  />
                  <span>{o.texto}</span>
                </label>
              ))}
            </div>

            {respondida && (
              <div className={`mt-3 text-sm ${correcto ? 'text-green-600' : 'text-red-600'}`}>
                {correcto ? '✅ Correcto' : `❌ Incorrecto — correcta: ${p.opciones[correctaIdx]?.texto ?? ''}`}
              </div>
            )}
          </div>
        );
      })}

      {asignatura && pregs.length > 0 && (
        <div className="mt-4 font-medium">
          Resultado parcial: {stats.ok}/{stats.total} ({stats.pct.toFixed(1)}%)
        </div>
      )}
    </div>
  );
}
