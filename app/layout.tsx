import '../public/css/estilo.css';
import '../public/css/banner.css';
import '../public/css/blog.css';
import '../public/css/info.css';
import '../public/css/acceso.css';
import '../public/css/alumno.css';
import '../public/css/info_alumno.css';
import '../public/css/fontello.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/imagen/upn-hidalgo.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
