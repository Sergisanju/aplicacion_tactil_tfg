# Aplicación Táctil TFG

Esta es una aplicación táctil desarrollada para la evaluación cognitiva de usuarios. La aplicación está construida utilizando Node.js, React y Firebase. Este README proporciona una guía completa para configurar el entorno de desarrollo, desplegar la aplicación y entender la estructura del proyecto.

## Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Despliegue de la Aplicación](#despliegue-de-la-aplicación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Acceso a Firebase](#acceso-a-firebase)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Requisitos del Sistema

Para desarrollar y mantener la aplicación, asegúrate de tener instalados los siguientes componentes:

- Node.js (v20.11.1)
- npm (incluido con Node.js)
- Firebase CLI
- Git

## Configuración del Entorno de Desarrollo

Sigue estos pasos para configurar el entorno de desarrollo:

### Clonar el Repositorio

1. Abre una terminal y clona el repositorio:
    ```sh
    git clone https://github.com/Sergisanju/aplicacion_tactil_tfg.git
    cd aplicacion_tactil_tfg
    ```

### Instalar Dependencias

2. Instala Node.js y npm desde [nodejs.org](https://nodejs.org/).
3. Verifica la instalación:
    ```sh
    node -v
    npm -v
    ```
4. Instala las dependencias del proyecto:
    ```sh
    npm install
    ```

## Despliegue de la Aplicación

### Arranque del Frontend

1. Asegúrate de estar en el directorio raíz del proyecto.
2. Inicia el servidor de desarrollo de React:
    ```sh
    npm start
    ```
3. La aplicación estará disponible en `http://localhost:3000`.

### Arranque del Backend

1. Inicia sesión en Firebase desde la terminal:
    ```sh
    firebase login
    ```
2. Despliega el backend en Firebase:
    ```sh
    firebase deploy
    ```

## Estructura del Proyecto

La estructura general del proyecto es la siguiente:

- **.github**: Configuraciones para GitHub, como flujos de trabajo de GitHub Actions.
- **build**: Carpeta generada automáticamente al compilar la aplicación para producción.
- **functions**: Contiene las funciones de Firebase (Cloud Functions) para el backend.
- **node_modules**: Módulos y paquetes instalados por npm necesarios para el proyecto.
- **public**: Archivos estáticos como imágenes y el archivo `index.html`.
- **src**: Todo el código fuente del proyecto, incluyendo componentes de React, servicios y utilidades.
  - **assets**: Recursos como imágenes.
  - **components**: Componentes de React organizados por funcionalidades.
  - **upload-json**: Directorio para la subida de archivos JSON.
  - **App.css**: Estilos CSS para la aplicación principal.
  - **App.js**: Componente principal de la aplicación.
  - **firebase-config.js**: Configuración de Firebase.
  - **index.css**: Estilos CSS globales.
  - **index.js**: Punto de entrada principal de la aplicación.
- **.env**: Archivo de variables de entorno con configuraciones sensibles (no incluido en el repositorio).
- **.firebaserc**: Configuración de Firebase para el proyecto.
- **.gitignore**: Especifica los archivos y directorios que Git debe ignorar.
- **firebase.json**: Configuración de Firebase Hosting.
- **package-lock.json**: Describe la estructura completa de las dependencias del proyecto.
- **package.json**: Lista las dependencias del proyecto y scripts de npm.

## Acceso a Firebase

Para que la aplicación funcione correctamente, sigue estos pasos:

1. **Solicitar Acceso al Proyecto de Firebase**: Asegúrate de que el propietario del proyecto te ha otorgado acceso desde la [consola de Firebase](https://console.firebase.google.com/).
2. **Credenciales y Configuración**: Las credenciales necesarias estarán incluidas en el proyecto clonado. Configura tu archivo `.env` con las siguientes variables:
    ```plaintext
    REACT_APP_FIREBASE_API_KEY=your_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
    REACT_APP_FIREBASE_DATABASE_URL=your_database_url
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    REACT_APP_FIREBASE_APP_ID=your_app_id
    REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```
3. **Archivo `serviceAccountKey`**: Este archivo contiene las credenciales privadas necesarias para desplegar y ejecutar funciones de Firebase en el servidor. Solicita este archivo al propietario del proyecto y guárdalo en un lugar seguro.
