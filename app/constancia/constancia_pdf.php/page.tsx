import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'

// @ts-expect-error Next.js App Router injecta searchParams
export default async function Page({ searchParams }) {
  const id_constancia =
    typeof searchParams?.id_constancia === 'string'
      ? searchParams.id_constancia
      : Array.isArray(searchParams?.id_constancia)
        ? searchParams.id_constancia[0]
        : undefined

  if (!id_constancia) return notFound();

  const { data: constancia } = await supabase
    .from('constancias')
    .select('*')
    .eq('id', id_constancia)
    .single();

  if (!constancia) {
    return (
      <center>
        <section id="bienvenidos">
          <h3>Universidad Pedagógica Nacional<br />Unidad 131-Hidalgo</h3>
          <br />
          <p>Sistema de verificación de Constancias</p>
        </section>
        <div style={{ color: 'red', fontWeight: 'bold', fontSize: 18, marginTop: 20 }}>
          Constancia no encontrada
        </div>
      </center>
    );
  }

  return (
    <center>
      <section id="bienvenidos">
        <h3>Universidad Pedagógica Nacional<br />Unidad 131-Hidalgo</h3>
        <br />
        <p>Sistema de verificación de Constancias</p>
      </section>
      <section id="acceso">
        <div className="container_alumno">
          <div className="row">
            <div className="col-25_alumno"><label><b>Sede:</b></label></div>
            <div className="col-75_alumno"><label>{constancia.sede || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Nombre:</b></label></div>
            <div className="col-75_alumno"><label>{constancia.nombre || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Curso:</b></label></div>
            <div className="col-75_alumno"><label>{constancia.curso || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Duración:</b></label></div>
            <div className="col-75_alumno"><label>{constancia.duracion || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Fecha expedición:</b></label></div>
            <div className="col-75_alumno"><label>{constancia.fecha_expedicion || '-'}</label></div>
          </div>
        </div>
      </section>
    </center>
  );
}
