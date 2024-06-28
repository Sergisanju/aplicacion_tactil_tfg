# Aplicación Táctil TFG

Esta es una aplicación táctil desarrollada para la evaluación cognitiva de usuarios. La aplicación está construida utilizando Node.js, React y Firebase. Este README proporciona una guía completa para configurar el entorno de desarrollo, desplegar la aplicación y entender la estructura del proyecto.

## Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
  - [Clonar el Repositorio](#clonar-el-repositorio)
  - [Instalar Dependencias](#instalar-dependencias)
  - [Configuración desde Cero](#configuración-desde-cero)
- [Despliegue de la Aplicación](#despliegue-de-la-aplicación)
  - [Arranque del Frontend](#arranque-del-frontend)
  - [Arranque del Backend](#arranque-del-backend)
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

### Opción 1: Clonar el Repositorio

Sigue estos pasos para configurar el entorno de desarrollo clonando el repositorio existente:

#### Clonar el Repositorio

1. Abre una terminal y clona el repositorio:
    ```sh
    git clone https://github.com/Sergisanju/aplicacion_tactil_tfg.git
    cd aplicacion_tactil_tfg
    ```

#### Instalar Dependencias

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

### Opción 2: Configuración desde Cero

Sigue estos pasos si deseas iniciar un nuevo proyecto desde cero:

#### 1. Instalar Node.js y npm

1. Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/). La instalación de Node.js incluye npm (Node Package Manager).

2. Verifica la instalación abriendo una terminal y ejecutando los siguientes comandos:
    ```sh
    node -v
    npm -v
    ```

#### 2. Crear el Proyecto con Create React App

3. Utiliza Create React App para crear una nueva aplicación React. Abre una terminal y ejecuta:
    ```sh
    npx create-react-app aplicacion-tactil-tfg
    cd aplicacion-tactil-tfg
    ```

#### 3. Configurar Firebase

##### Crear un Nuevo Proyecto de Firebase

1. Ve a la [consola de Firebase](https://console.firebase.google.com/).
2. Haz clic en "Agregar proyecto" y sigue las instrucciones para crear un nuevo proyecto.

##### Configurar Firebase para el Proyecto

3. Una vez creado el proyecto, ve a la sección "Configuración del proyecto" y selecciona "Tus aplicaciones".
4. Agrega una nueva aplicación web y sigue las instrucciones. Obtendrás un conjunto de claves de configuración de Firebase. Añade estas claves a un archivo `.env` en la raíz del proyecto:
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

##### Instalar Firebase SDK

5. Instala Firebase SDK en tu proyecto:
    ```sh
    npm install firebase
    ```

#### 4. Configurar Firebase CLI

##### Instalar Firebase CLI

1. Instala Firebase CLI si no lo tienes:
    ```sh
    npm install -g firebase-tools
    ```

##### Iniciar Sesión en Firebase

2. Inicia sesión en Firebase:
    ```sh
    firebase login
    ```

##### Inicializar Firebase en el Proyecto

3. Inicializa Firebase en el proyecto:
    ```sh
    firebase init
    ```
    Selecciona las siguientes opciones:
    - Firestore: Configurar Firestore.
    - Functions: Configurar Cloud Functions.
    - Hosting: Configurar Firebase Hosting.
    - Si es necesario, selecciona también otros servicios que vayas a utilizar.

#### 5. Configurar el Proyecto React

##### Crear el Archivo de Configuración de Firebase

1. Crea un archivo `src/firebase-config.js` y añade la configuración de Firebase:
    ```javascript
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    export default app;
    ```

### 6. Crear la Estructura del Proyecto

#### Estructura de Directorios

Asegúrate de que la estructura de directorios sea la siguiente:

```plaintext
aplicacion-tactil-tfg/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.css
│   ├── App.js
│   ├── firebase-config.js
│   ├── index.css
│   └── index.js
├── .env
├── .firebaserc
├── .gitignore
├── firebase.json
├── package-lock.json
└── package.json
