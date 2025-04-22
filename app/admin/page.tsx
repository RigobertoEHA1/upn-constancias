'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { QRCodeCanvas } from 'qrcode.react'

const SEDE_FIJA = 'HUEJUTLA'

const CURSOS = [
  { value: 'Curso "El docente profesional que queremos"', label: 'Curso "El docente profesional que queremos"' },
  { value: 'Curso "Estrategias didácticas para la enseñanza"', label: 'Curso "Estrategias didácticas para la enseñanza"' },
  { value: 'Curso "Evaluación del aprendizaje"', label: 'Curso "Evaluación del aprendizaje"' },
  { value: 'Curso "Tecnologías educativas"', label: 'Curso "Tecnologías educativas"' },
  { value: 'Curso "Gestión del aula"', label: 'Curso "Gestión del aula"' },
  { value: 'Curso "Desarrollo de competencias"', label: 'Curso "Desarrollo de competencias"' },
  { value: 'Curso "Planeación didáctica"', label: 'Curso "Planeación didáctica"' },
  { value: 'Curso "Inclusión educativa"', label: 'Curso "Inclusión educativa"' },
  { value: 'Curso "Innovación educativa"', label: 'Curso "Innovación educativa"' }
];

// Formatea fecha "yyyy-mm-dd" a "14 de octubre de 2023" (sin desfase)
function formatearFecha(fechaISO: string) {
  if (!fechaISO) return '';
  const [year, month, day] = fechaISO.split('-');
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const nombreMes = meses[parseInt(month, 10) - 1];
  return `${parseInt(day, 10)} de ${nombreMes} de ${year}`;
}

type Constancia = {
  id: number,
  sede: string,
  nombre: string,
  curso: string,
  duracion: string,
  fecha_expedicion: string
}

export default function Admin() {
  const [form, setForm] = useState({
    id: '',
    nombre: '',
    curso: CURSOS[0].label,
    duracion: '',
    fecha_expedicion: ''
  })
  const [msg, setMsg] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)
  const [checkingId, setCheckingId] = useState(false)
  const [constanciaExistente, setConstanciaExistente] = useState<boolean>(false)
  const [constancias, setConstancias] = useState<Constancia[]>([])
  const [editando, setEditando] = useState<boolean>(false)
  const [idOriginal, setIdOriginal] = useState<number | null>(null)
  const [qrLink, setQrLink] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  // Carga todas las constancias al iniciar y cuando hay cambios
  async function cargarConstancias() {
    const { data } = await supabase
      .from('constancias')
      .select('*')
      .order('id', { ascending: true })
    setConstancias(data || [])
  }

  useEffect(() => {
    cargarConstancias()
  }, [])

  // Verifica si el ID ya existe
  async function checkIdExists(id: string) {
    setCheckingId(true)
    setErrorId(null)
    setConstanciaExistente(false)
    if (!id) {
      setCheckingId(false)
      return
    }
    const { data } = await supabase
      .from('constancias')
      .select('id')
      .eq('id', Number(id))
      .maybeSingle()
    if (data && (!editando || Number(id) !== idOriginal)) {
      setErrorId('Este ID ya existe. Puedes borrar la constancia guardada si lo deseas.')
      setConstanciaExistente(true)
    } else {
      setErrorId(null)
      setConstanciaExistente(false)
    }
    setCheckingId(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setErrorId(null)

    if (!editando || Number(form.id) !== idOriginal) {
      const { data: existe } = await supabase
        .from('constancias')
        .select('id')
        .eq('id', Number(form.id))
        .maybeSingle()
      if (existe) {
        setErrorId('Este ID ya existe. Puedes borrar la constancia guardada si lo deseas.')
        setConstanciaExistente(true)
        return
      }
    }

    const fechaFormateada = formatearFecha(form.fecha_expedicion)
    const duracionFinal = form.duracion.trim() + ' horas'

    if (editando) {
      // Actualizar constancia
      const { error } = await supabase
        .from('constancias')
        .update({
          id: Number(form.id),
          sede: SEDE_FIJA,
          nombre: form.nombre,
          curso: form.curso,
          duracion: duracionFinal,
          fecha_expedicion: fechaFormateada
        })
        .eq('id', idOriginal!)
      if (error) {
        setMsg('Error al actualizar: ' + error.message)
      } else {
        setMsg(`Constancia actualizada correctamente. ID: ${form.id}`)
        setForm({
          id: '',
          nombre: '',
          curso: CURSOS[0].label,
          duracion: '',
          fecha_expedicion: ''
        })
        setEditando(false)
        setIdOriginal(null)
        cargarConstancias()
      }
    } else {
      // Insertar nueva constancia
      const { error } = await supabase
        .from('constancias')
        .insert([{
          id: Number(form.id),
          sede: SEDE_FIJA,
          nombre: form.nombre,
          curso: form.curso,
          duracion: duracionFinal,
          fecha_expedicion: fechaFormateada
        }])
      if (error) {
        setMsg('Error al guardar: ' + error.message)
      } else {
        setMsg(`Constancia guardada correctamente. ID: ${form.id}`)
        setForm({
          id: '',
          nombre: '',
          curso: CURSOS[0].label,
          duracion: '',
          fecha_expedicion: ''
        })
        cargarConstancias()
      }
    }
    setConstanciaExistente(false)
  }

  async function handleDelete(id: number) {
    const { error } = await supabase
      .from('constancias')
      .delete()
      .eq('id', id)
    if (error) {
      setMsg('Error al borrar la constancia: ' + error.message)
    } else {
      setMsg('Constancia eliminada exitosamente.')
      cargarConstancias()
      if (editando && idOriginal === id) {
        setForm({
          id: '',
          nombre: '',
          curso: CURSOS[0].label,
          duracion: '',
          fecha_expedicion: ''
        })
        setEditando(false)
        setIdOriginal(null)
      }
    }
  }

  function handleEdit(constancia: Constancia) {
    const horas = constancia.duracion.replace(/\D/g, '')
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    let fechaISO = ''
    const match = constancia.fecha_expedicion.match(/(\d{1,2}) de (\w+) de (\d{4})/)
    if (match) {
      const d = match[1].padStart(2, '0')
      const m = (meses.indexOf(match[2]) + 1).toString().padStart(2, '0')
      const y = match[3]
      fechaISO = `${y}-${m}-${d}`
    }
    setForm({
      id: String(constancia.id),
      nombre: constancia.nombre,
      curso: constancia.curso,
      duracion: horas,
      fecha_expedicion: fechaISO
    })
    setEditando(true)
    setIdOriginal(constancia.id)
    setMsg(null)
    setErrorId(null)
  }

  async function handleDeleteRepetido() {
    if (!form.id) return
    await handleDelete(Number(form.id))
    setErrorId(null)
    setConstanciaExistente(false)
    checkIdExists(form.id)
  }

  function handleCopiarLink(id: number) {
    const link = `${window.location.origin}/constancia/constancia_pdf.php?id_constancia=${id}`
    navigator.clipboard.writeText(link)
      .then(() => setMsg('¡Enlace copiado al portapapeles!'))
      .catch(() => setMsg('No se pudo copiar el enlace.'))
  }

  function handleMostrarQR(id: number) {
    const link = `${window.location.origin}/constancia/constancia_pdf.php?id_constancia=${id}`
    setQrLink(link)
    setShowQr(true)
  }

  function handleCerrarQR() {
    setShowQr(false)
    setQrLink(null)
  }

  return (
    <div style={{
      maxWidth: 700, margin: '40px auto', background: '#f2f2f2',
      padding: 20, borderRadius: 10, boxShadow: '0 2px 10px #ccc'
    }}>
      <h2 style={{ marginBottom: 24 }}>Subir nueva constancia</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginTop: 10 }}>ID (asignado por ti):</label>
        <input
          type="number"
          required
          value={form.id}
          onChange={e => {
            setForm(f => ({ ...f, id: e.target.value }))
            checkIdExists(e.target.value)
          }}
          style={{ width: '100%' }}
          //disabled={editando}
        />
        {checkingId && <div style={{ color: '#888', fontSize: 12 }}>Verificando ID...</div>}
        {errorId && (
          <div style={{ color: 'red', fontSize: 13, marginBottom: 5 }}>
            {errorId}
            {constanciaExistente && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleDeleteRepetido}
                  style={{
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Borrar constancia guardada
                </button>
              </div>
            )}
          </div>
        )}

        <label style={{ display: 'block', marginTop: 10 }}>Sede:</label>
        <input
          type="text"
          value={SEDE_FIJA}
          disabled
          style={{
            width: '100%',
            background: '#eee',
            color: '#070157',
            fontWeight: 'bold',
            letterSpacing: 2
          }}
        />

        <label style={{ display: 'block', marginTop: 10 }}>Nombre:</label>
        <input
          type="text"
          required
          value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
          style={{ width: '100%' }}
        />

        <label style={{ display: 'block', marginTop: 10 }}>Curso:</label>
        <select
          required
          value={form.curso}
          onChange={e => setForm(f => ({ ...f, curso: e.target.value }))}
          style={{ width: '100%' }}
        >
          {CURSOS.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        <label style={{ display: 'block', marginTop: 10 }}>Duración (solo número):</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="number"
            min="1"
            required
            value={form.duracion}
            onChange={e => setForm(f => ({ ...f, duracion: e.target.value }))}
            placeholder="Ejemplo: 40"
            style={{ flex: 1 }}
          />
          <span style={{ marginLeft: 4 }}>horas</span>
        </div>

        <label style={{ display: 'block', marginTop: 10 }}>Fecha expedición:</label>
        <input
          type="date"
          required
          value={form.fecha_expedicion}
          onChange={e => setForm(f => ({ ...f, fecha_expedicion: e.target.value }))}
          style={{ width: '100%' }}
        />

        <button
          type="submit"
          style={{ marginTop: 18, width: '100%' }}
          disabled={!!errorId}
        >
          {editando ? "Actualizar" : "Guardar"}
        </button>
        {editando && (
          <button
            type="button"
            style={{
              marginTop: 10,
              width: '100%',
              background: '#888',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
            onClick={() => {
              setForm({
                id: '',
                nombre: '',
                curso: CURSOS[0].label,
                duracion: '',
                fecha_expedicion: ''
              })
              setEditando(false)
              setIdOriginal(null)
              setMsg(null)
              setErrorId(null)
            }}
          >
            Cancelar edición
          </button>
        )}
      </form>
      {msg && <div style={{ marginTop: 18, color: 'green', fontWeight: 'bold' }}>{msg}</div>}

      <hr style={{ margin: '40px 0 20px 0' }} />
      <h3>Constancias guardadas</h3>
      <div style={{
        background: '#fff',
        borderRadius: 6,
        border: '1px solid #ddd',
        padding: 8,
        marginTop: 10,
        maxHeight: 340,
        overflowY: 'auto'
      }}>
        {constancias.length === 0 && <p>No hay constancias guardadas.</p>}
        {constancias.map(constancia => (
          <div
            key={constancia.id}
            style={{
              borderBottom: '1px solid #eee',
              padding: 8,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1, fontSize: 14 }}>
              <b>ID:</b> {constancia.id}
              <br /><b>Sede:</b> {constancia.sede}
              <br /><b>Nombre:</b> {constancia.nombre}
              <br /><b>Curso:</b> {constancia.curso}
              <br /><b>Duración:</b> {constancia.duracion}
              <br /><b>Fecha:</b> {constancia.fecha_expedicion}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
                onClick={() => handleEdit(constancia)}
              >
                Editar
              </button>
              <button
                style={{
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
                onClick={() => handleDelete(constancia.id)}
              >
                Eliminar
              </button>
              <button
                style={{
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
                onClick={() => handleCopiarLink(constancia.id)}
              >
                Copiar Link
              </button>
              <button
                style={{
                  background: '#ffa600',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
                onClick={() => handleMostrarQR(constancia.id)}
              >
                QR
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para QR */}
      {showQr && qrLink && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}
          onClick={handleCerrarQR}
        >
          <div style={{
            background: '#fff', padding: 30, borderRadius: 8, position: 'relative', minWidth: 260
          }}
            onClick={e => e.stopPropagation()}
            ref={qrRef}
          >
            <div style={{ textAlign: 'center' }}>
              <QRCodeCanvas value={qrLink} size={180} />
              <div style={{ wordBreak: 'break-all', margin: '10px 0 0 0', fontSize: 13 }}>{qrLink}</div>
              <button style={{
                marginTop: 10,
                background: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '4px 16px',
                cursor: 'pointer'
              }} onClick={handleCerrarQR}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
