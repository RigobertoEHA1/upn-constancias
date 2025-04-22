import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';

// Next.js App Router usa props "searchParams" para query strings
export default async function Constancia({
  searchParams
}: {
  searchParams: { id_constancia?: string }
}) {
  const id = searchParams.id_constancia;
  if (!id) return notFound();

  const { data: constancia } = await supabase
    .from('constancias')
    .select('*')
    .eq('id', id)
    .single();

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
            <div className="col-75_alumno"><label>{constancia?.sede || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Nombre:</b></label></div>
            <div className="col-75_alumno"><label>{constancia?.nombre || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Curso:</b></label></div>
            <div className="col-75_alumno"><label>{constancia?.curso || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Duración:</b></label></div>
            <div className="col-75_alumno"><label>{constancia?.duracion || '-'}</label></div>
            <div className="col-25_alumno"><label><b>Fecha expedición:</b></label></div>
            <div className="col-75_alumno"><label>{constancia?.fecha_expedicion || '-'}</label></div>
          </div>
        </div>
      </section>
      {!constancia && (
        <div style={{ color: 'red', fontWeight: 'bold', fontSize: 18, marginTop: 20 }}>Constancia no encontrada</div>
      )}
    </center>
  );
}
