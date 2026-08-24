# 🚌 Movili

Aplicación móvil para visualizar buses urbanos en tiempo real. Desarrollada con **Expo (React Native)** y **Supabase** como backend.

---

## 🧰 ¿Con qué está hecho?

| Tecnología | Versión | Para qué sirve |
|---|---|---|
| [Expo](https://expo.dev/) | SDK 54 | Framework para apps React Native |
| [React Native](https://reactnative.dev/) | 0.81.5 | Motor de la interfaz móvil |
| [React](https://react.dev/) | 19.1.0 | Librería de componentes UI |
| [Supabase](https://supabase.com/) | — | Base de datos, autenticación y backend |
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | — | Cliente de Supabase para JS |
| [@react-navigation/native](https://reactnavigation.org/) | — | Navegación entre pantallas |
| [Expo Go](https://expo.dev/go) | SDK 54 | App para probar en el celular sin compilar |
| [Node.js](https://nodejs.org/) | 18+ | Entorno de ejecución para las herramientas |

---

## 📋 Requisitos previos

Antes de empezar, asegurate de tener instalado lo siguiente en tu computadora:

- **Node.js** versión 18 o superior → [Descargar aquí](https://nodejs.org/)
- **npm** (viene incluido con Node.js)
- **Git** → [Descargar aquí](https://git-scm.com/)
- **Expo Go** instalado en tu celular Android o iOS → [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779)

> ⚠️ **Importante:** La versión de Expo Go en tu celular debe ser para **SDK 54**. Verificá que la app esté actualizada en la tienda.

---

## 🚀 Pasos para correr el proyecto

### 1. Clonar el repositorio

Abrí una terminal (PowerShell, CMD o cualquier terminal) y ejecutá:

```bash
git clone https://github.com/arnaldofarias312-source/APP.git
cd APP/movili
```

---

### 2. Instalar las dependencias

```bash
npm install --legacy-peer-deps
```

> El flag `--legacy-peer-deps` es necesario por compatibilidades entre React 19 y algunas librerías de Expo.

---

### 3. Configurar las variables de entorno

En la carpeta `movili/`, hay un archivo llamado `.env.example`. Copialo y renombralo a `.env`:

**En Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**En Mac/Linux:**
```bash
cp .env.example .env
```

Luego abrí el archivo `.env` y completá los valores con tus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

> Estos valores los encontrás en tu proyecto de Supabase → **Project Settings → API**.

---

### 4. Conectar el celular a la misma red Wi-Fi

El celular y la computadora **deben estar conectados a la misma red Wi-Fi** para que la app se comunique con Metro (el servidor de desarrollo de Expo).

> ⚠️ Si tenés una VPN activa en la computadora, **desactivala** antes de continuar. Las VPNs interfieren con la conexión LAN.

---

### 5. Iniciar el servidor de desarrollo

```bash
npx expo start --clear
```

Esto abrirá en la terminal un **código QR**.

---

### 6. Abrir la app en el celular

1. Abrí la app **Expo Go** en tu celular.
2. Tocá **"Scan QR Code"**.
3. Escaneá el QR que aparece en la terminal.
4. La app Movili se cargará automáticamente en tu celular.

---

## 📁 Estructura del proyecto

```
movili/
├── App.js                            # Punto de entrada, manejo de sesión y navegación
├── .env                              # Variables de entorno (NO se sube a GitHub)
├── .env.example                      # Plantilla de variables de entorno
├── src/
│   ├── lib/
│   │   └── supabase.js               # Cliente de Supabase (con y sin persistencia de sesión)
│   ├── screens/
│   │   ├── LoginScreen.jsx           # Pantalla de inicio de sesión
│   │   ├── RegisterScreen.jsx        # Pantalla de registro de cuenta
│   │   ├── ForgotPasswordScreen.jsx  # Recuperación de contraseña (email → código OTP)
│   │   └── MapScreen.jsx             # Pantalla del mapa (en desarrollo)
│   └── components/
│       └── StatusModal.jsx           # Modal estético reutilizable (éxito, error, advertencia, info)
└── package.json
```

---

## 🔐 Configuración de Supabase

El proyecto usa **Supabase** para autenticación. Las configuraciones necesarias en el dashboard de Supabase son:

### Autenticación
- **Email/Password** habilitado en: Authentication → Providers → Email
- **Confirm email:** desactivado (el usuario entra directo al registrarse)

### SMTP (correo personalizado)
Para que Supabase envíe correos desde tu cuenta en vez del correo genérico:

1. Ir a: **Project Settings → Authentication → SMTP Settings**
2. Activar **"Enable Custom SMTP"**
3. Completar:
   - **Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **Username:** tu correo Gmail completo (ej: `tucorreo@gmail.com`)
   - **Password:** la contraseña de aplicación de Gmail (16 caracteres, sin espacios)
   - **Sender email:** tu correo Gmail
   - **Sender name:** `Movili`

> Para obtener la contraseña de aplicación de Gmail: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Plantilla de correo (Recuperar contraseña)
La plantilla de correo debe mostrar el **token de 8 dígitos** en vez de un link. Ir a:
**Authentication → Email Templates → Reset Password** y usar una plantilla con `{{ .Token }}`.

---

## 🔑 Flujo de recuperación de contraseña

1. El usuario ingresa su correo en la pantalla "Olvidé mi contraseña".
2. Supabase envía un correo con un **código de 8 dígitos** (OTP).
3. El usuario ingresa ese código + su nueva contraseña en la app.
4. La contraseña se actualiza y el usuario es redirigido al login.

---

## ⚠️ Solución de problemas comunes

| Problema | Solución |
|---|---|
| La app no se conecta / QR no funciona | Verificá que computadora y celular estén en la misma Wi-Fi y que la VPN esté desactivada |
| Error "SDK version mismatch" | Asegurate de que Expo Go en tu celular sea para SDK 54 |
| Error al iniciar sesión después de registrarse | Normal — la sesión no se inicia automáticamente. Iniciá sesión manualmente |
| El código de recuperación no llega | Revisá la carpeta de spam. Hay un rate limit: esperá 60 segundos entre solicitudes |
| Metro muestra IP 127.0.0.1 | Hay adaptadores de red virtuales o VPN activos. Desactivarlos y correr `npx expo start --clear` |

---

## 🛣️ Estado del proyecto

- [x] Autenticación completa (registro, login, recuperar contraseña)
- [x] Correos personalizados con SMTP de Gmail
- [x] Modales estéticos con diseño Movili
- [ ] Pantalla del mapa con buses en tiempo real *(en desarrollo)*
- [ ] Perfil de usuario
- [ ] Notificaciones push
