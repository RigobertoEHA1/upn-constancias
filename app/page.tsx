'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [id, setId] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    router.push(`/constancia/constancia_pdf.php?id_constancia=${id}`);
  }

  return (
    <center>
      <section id="bienvenidos">
        <h3>Universidad Pedagógica Nacional<br />Unidad 131-Hidalgo</h3>
        <br />
        <p>Sistema de verificación de Constancias</p>
      </section>
      <form onSubmit={handleSubmit} style={{ marginTop: 50 }}>
        <input
          style={{ fontSize: 20, padding: 8 }}
          type="number"
          placeholder="Ingrese el ID de su constancia"
          value={id}
          onChange={e => setId(e.target.value)}
          required
        />
        <button style={{ fontSize: 20, marginLeft: 10 }} type="submit">Buscar</button>
      </form>
    </center>
  );
}
