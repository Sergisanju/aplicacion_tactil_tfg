import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import './AnalisisDeDatos.css';

const AnalisisDeDatos = () => {
  const [usuarios, setUsuarios] = useState([]); // Estado para almacenar la lista de usuarios asociados
  const [error, setError] = useState(''); // Estado para manejar errores
  const firestore = getFirestore(); // Obtiene la instancia de Firestore
  const auth = getAuth(); // Obtiene la instancia de autenticación de Firebase
  const usuarioActual = auth.currentUser; // Obtiene el usuario autenticado actualmente

  // useEffect se ejecuta al montar el componente para obtener los usuarios asociados
  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        if (!usuarioActual) { // Verifica si el usuario está autenticado
          setError('Usuario no autenticado');
          return;
        }

        // Obtiene el documento del usuario analista autenticado desde Firestore
        const analistaDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
        if (!analistaDoc.exists()) { // Verifica si el documento existe
          setError('No se encontró el documento del usuario analista');
          return;
        }

        // Extrae la lista de IDs de usuarios asociados del documento del analista
        const asociados = analistaDoc.data().asociados || []; // Obtiene la lista de IDs o un array vacío
        if (asociados.length === 0) { // Verifica si hay usuarios asociados
          setError('No hay usuarios asociados');
          return;
        }

        // Crea una consulta para obtener los documentos de los usuarios asociados usando sus IDs
        const usuariosQuery = query(
          collection(firestore, 'users'), // Accede a la colección 'users' en Firestore
          where('__name__', 'in', asociados) // Filtra por IDs que están en la lista 'asociados'
        );

        // Ejecuta la consulta y obtiene un snapshot de los documentos que coinciden
        const usuariosSnapshot = await getDocs(usuariosQuery);

        // Convierte el snapshot en una lista de objetos de usuario
        const listaUsuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsuarios(listaUsuarios); // Actualiza el estado con la lista de usuarios obtenidos
      } catch (error) {
        setError('Error al obtener los usuarios asociados'); // Maneja cualquier error que ocurra
        console.error(error); // Muestra el error en la consola
      }
    };

    obtenerUsuarios(); 
  }, [firestore, usuarioActual]); // Dependencias: ejecuta este efecto cuando 'firestore' o 'usuarioActual' cambian

  // Función para obtener datos de un usuario específico
  const obtenerDatosUsuario = async (usuarioId) => {
    try {
      // Obtiene el documento del usuario por ID desde Firestore
      const usuarioDoc = await getDoc(doc(firestore, 'users', usuarioId));

      if (!usuarioDoc.exists()) { // Verifica si el documento existe
        throw new Error('Usuario no encontrado');
      }

      // Obtiene las evaluaciones del usuario desde Firestore
      const evaluacionesSnapshot = await getDocs(collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${usuarioId}/resultados`));
      const evaluaciones = evaluacionesSnapshot.docs.map(doc => doc.data());

      return {
        ...usuarioDoc.data(), // Datos básicos del usuario
        evaluaciones // Agrega las evaluaciones del usuario
      };
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error); // Muestra el error en la consola
      throw error; 
    }
  };

  // Convierte los datos de los usuarios a formato CSV
  const convertirDatosACSV = (datosUsuarios) => {
    // Encabezado del CSV
    let csvContent = 'Nombre,Email,Categoría,Nivel,Dificultad,Intentos,Aciertos,Errores,Duración,Fecha\n';

    // Agrega los datos de cada usuario al CSV
    datosUsuarios.forEach(datosUsuario => {
      const { nombre, email, evaluaciones } = datosUsuario;

      //Iteramos sobre cada evaluacion y sus valores/resultados
      evaluaciones.forEach(evaluacion => { 
        const { categoria, nivel, dificultad, intentos, aciertos, errores, duracion, timestamp } = evaluacion;
        const fecha = new Date(timestamp).toLocaleString(); // Convierte la fecha a formato local
        //Añadimos los valores a la fila separados por comas
        csvContent += `${nombre},${email},${categoria},${nivel},${dificultad},${intentos},${aciertos},${errores},${convertirSegundosAMinutosSegundos(duracion)},${fecha}\n`;
      });
    });

    return csvContent; // Devuelve el contenido en formato CSV
  };

  // Convierte segundos a formato minutos:segundos
  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60); // Calcula los minutos
    const segundosRestantes = segundos % 60; // Calcula los segundos restantes
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`; // Formatea en mm:ss
  };

  // Exporta los datos de un usuario específico a un archivo CSV
  const exportarDatos = async (usuarioId) => {
    try {
      const datosUsuario = await obtenerDatosUsuario(usuarioId); // Obtiene los datos del usuario
      const csvContent = convertirDatosACSV([datosUsuario]); // Convierte los datos a CSV

      const { nombre } = datosUsuario;
      const nombreArchivo = nombre.toLowerCase().replace(/ /g, '_'); // Genera el nombre del archivo

      // Crear un Blob(objeto que representa un archivo de datos) con el contenido CSV y el tipo correcto con codificacion utf-8 para caracteres especiales
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a'); //Crea un elemento de enlace en el DOM
      link.href = URL.createObjectURL(blob); // Crea un enlace al Blob (archivo), es una URL temporal
      link.setAttribute('download', `resultados_${nombreArchivo}.csv`); // Nombre del archivo

      document.body.appendChild(link); //Agregamos el enlace al DOM
      link.click(); // Dispara la descarga
      document.body.removeChild(link); //Limpiamos el documento eliminando el enlace del DOM
    } catch (error) {
      console.error('Error al exportar los datos:', error); 
    }
  };

  // Exporta los datos de todos los usuarios a un archivo CSV
  const exportarTodosLosDatos = async () => {
    try {
      //Obtiene todos los datos de todos los usuarios esperando a que todas las promesas se completen
      const datosUsuarios = await Promise.all(
        usuarios.map(usuario => obtenerDatosUsuario(usuario.id)) // Obtiene los datos de todos los usuarios devolviendo una promesa para cada usuario
      );

      const csvContent = convertirDatosACSV(datosUsuarios); // Convierte los datos a CSV

      // Crear un Blob con el contenido CSV y el tipo correcto
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob); // Crea un enlace al Blob
      link.setAttribute('download', `resultados_usuarios.csv`); // Nombre del archivo

      document.body.appendChild(link);
      link.click(); // Dispara la descarga
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar los datos:', error); // Muestra el error en la consola
    }
  };

  return (
    <div className="analista-usuarios-container">
      <h1>Usuarios Asociados</h1>
      {error && <p className="error">{error}</p>}
      <div className="lista-usuarios">
        {usuarios.map(usuario => (
          <div key={usuario.id} className="usuario-item">
            <p>{usuario.nombre}</p>
            <Link to={`/analisis-datos/${usuario.id}/evaluaciones`} className="boton-ver-evaluaciones">Ver Evaluaciones</Link>
            <button onClick={() => exportarDatos(usuario.id)} className="boton-exportar-datos">Exportar Datos</button>
          </div>
        ))}
        {usuarios.length > 1 && (
          <button onClick={exportarTodosLosDatos} className="boton-exportar-todos">Exportar Todos los Datos</button>
        )}
      </div>
    </div>
  );
};

export default AnalisisDeDatos;