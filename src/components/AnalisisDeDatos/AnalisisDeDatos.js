import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import './AnalisisDeDatos.css';

const AnalisisDeDatos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const firestore = getFirestore();
  const auth = getAuth();
  const usuarioActual = auth.currentUser;

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        if (!usuarioActual) {
          setError('Usuario no autenticado');
          return;
        }

        const analistaDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
        if (!analistaDoc.exists()) {
          setError('No se encontró el documento del usuario analista');
          return;
        }

        const asociados = analistaDoc.data().asociados || [];
        if (asociados.length === 0) {
          setError('No hay usuarios asociados');
          return;
        }

        const usuariosQuery = query(collection(firestore, 'users'), where('__name__', 'in', asociados));
        const usuariosSnapshot = await getDocs(usuariosQuery);
        const listaUsuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsuarios(listaUsuarios);
      } catch (error) {
        setError('Error al obtener los usuarios asociados');
        console.error(error);
      }
    };

    obtenerUsuarios();
  }, [firestore, usuarioActual]);

  const obtenerDatosUsuario = async (usuarioId) => {
    try {
      const usuarioDoc = await getDoc(doc(firestore, 'users', usuarioId));

      if (!usuarioDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const evaluacionesSnapshot = await getDocs(collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${usuarioId}/resultados`));
      const evaluaciones = evaluacionesSnapshot.docs.map(doc => doc.data());

      return {
        ...usuarioDoc.data(),
        evaluaciones
      };
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      throw error;
    }
  };

  const convertirDatosACSV = (datosUsuarios) => {
    let csvContent = 'Nombre,Email,Categoría,Nivel,Dificultad,Intentos,Aciertos,Errores,Duración,Fecha\n';

    datosUsuarios.forEach(datosUsuario => {
      const { nombre, email, evaluaciones } = datosUsuario;

      evaluaciones.forEach(evaluacion => {
        const { categoria, nivel, dificultad, intentos, aciertos, errores, duracion, timestamp } = evaluacion;
        const fecha = new Date(timestamp).toLocaleString();
        csvContent += `${nombre},${email},${categoria},${nivel},${dificultad},${intentos},${aciertos},${errores},${convertirSegundosAMinutosSegundos(duracion)},${fecha}\n`;
      });
    });

    return csvContent;
  };

  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
  };

  const exportarDatos = async (usuarioId) => {
    try {
      const datosUsuario = await obtenerDatosUsuario(usuarioId);
      const csvContent = convertirDatosACSV([datosUsuario]);

      const { nombre } = datosUsuario;
      const nombreArchivo = nombre.toLowerCase().replace(/ /g, '_');

      // Crear un Blob con el contenido CSV y el tipo correcto
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `resultados_cartas_memoria_${nombreArchivo}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar los datos:', error);
    }
  };

  const exportarTodosLosDatos = async () => {
    try {
      const datosUsuarios = await Promise.all(
        usuarios.map(usuario => obtenerDatosUsuario(usuario.id))
      );

      const csvContent = convertirDatosACSV(datosUsuarios);

      // Crear un Blob con el contenido CSV y el tipo correcto
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `resultados_cartas_memoria_usuarios.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar los datos:', error);
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
