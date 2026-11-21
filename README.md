# Panel de Clientes y Admin con Discord OAuth2 (Next.js + Vercel)

## Pasos para usar:
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env.local` (o configura en Vercel -> Settings -> Environment Variables) con:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI` (ej. `https://tu-proyecto.vercel.app/api/auth/callback`)
   - `ADMIN_DISCORD_ID` (tu ID numérico de Discord)
   - `JWT_SECRET` (clave secreta larga de 32+ caracteres)
3. Sube el proyecto a GitHub e impórtalo en Vercel.
