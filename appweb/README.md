# Calculadora de canalización · Conéctate

## Estructura
```
index.html        Pantalla principal (acceso y aplicación)
css/styles.css    Estilos
js/calc.js        Motor de cálculo (sin acceso al DOM)
js/pdf.js         Generación del PDF de presupuestos
js/app.js         Interfaz, sesión, proyectos y presupuestos
config.js         URL y clave publicable de Supabase
logo.js           Logo de Conéctate en base64
supabase.sql      Script de base de datos (ya aplicado en calculadora-login)
```

## Puesta en marcha
1. Pega tu logo en `logo.js` (ver comentario dentro del archivo).
2. Sube la carpeta completa al repositorio de GitHub (rama principal). Mantén `index.html` en la raíz.
3. En GitHub Pages o tu hosting, verifica que `conectategt.online` sirva el mismo `index.html`.
4. En Supabase > Authentication > URL Configuration:
   - Site URL: `https://conectategt.online`
   - Redirect URLs: `https://conectategt.online/**` (y `http://localhost:*` si pruebas en local)
5. En Supabase > Authentication > Providers, confirma que Google está activo si quieres ese acceso.

## Seguridad aplicada en la base de datos
- Row Level Security activo en `proyectos` y `cotizaciones`: cada usuario solo ve, crea, edita y borra lo suyo.
- Las políticas aplican solo a usuarios autenticados; el rol anónimo no tiene acceso.
- Un trigger impide cambiar el `user_id` de un registro existente.
- Sesión que se cierra tras 30 minutos de inactividad.
- Contraseñas de al menos 8 caracteres.

## Pendiente recomendado
- En Supabase > Authentication > Settings, activa "Leaked password protection" y la confirmación de correo.
- Para usar el sistema fuera de Guatemala o en equipos compartidos, cierra sesión al terminar.

## Instalación como app (PWA)
- En Android (Chrome): menú ⋮ > "Instalar aplicación" o "Añadir a pantalla de inicio".
- En iPhone (Safari): botón Compartir > "Añadir a pantalla de inicio".
- Funciona sin conexión para abrir la pantalla y ver lo último cargado. Los cambios se guardan cuando vuelve la conexión.

## Actualizar la app
Cuando cambies archivos, sube el número de `CACHE` en `sw.js` (por ejemplo, `sicap-v7`) para que los teléfonos carguen la versión nueva.
