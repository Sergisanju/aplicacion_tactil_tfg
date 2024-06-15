import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import './AsociarJugadores.css';

const AsociarJugadores = () => {
  const { id } = useParams(); // Obtiene el ID del analista de la URL
  const [analista, setAnalista] = useState(null); // Estado para el analista actual
  const [jugadores, setJugadores] = useState([]); // Estado para todos los jugadores
  const [jugadoresFiltrados, setJugadoresFiltrados] = useState([]); // Estado para los jugadores filtrados según la búsqueda
  const [selectedJugadores, setSelectedJugadores] = useState([]); // Estado para jugadores seleccionados
  const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda de jugadores
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false); // Estado para mostrar el modal de confirmación
  const navigate = useNavigate(); // Hook para la navegación
  const firestore = getFirestore(); // Obtiene la instancia de Firestore

  // useEffect para obtener datos cuando el componente se monta
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtiene el documento del analista desde Firestore
        const analistaDoc = await getDoc(doc(firestore, 'users', id));
        if (analistaDoc.exists()) {
          const data = analistaDoc.data();
          setAnalista(data); // Almacena la información del analista
          setSelectedJugadores(data.asociados || []); // Almacena los jugadores ya asociados
        } else {
          console.error('El analista no existe.');
        }

        // Obtiene todos los documentos de jugadores desde Firestore
        const jugadoresSnapshot = await getDocs(collection(firestore, 'users'));
        const listaJugadores = jugadoresSnapshot.docs
          .filter(doc => doc.data().tipoUsuario === 'Jugador') // Filtra solo los jugadores
          .map(doc => ({ id: doc.id, ...doc.data() })); // Mapea los documentos a un array de objetos
        setJugadores(listaJugadores); // Almacena todos los jugadores
        setJugadoresFiltrados(listaJugadores); // Inicialmente todos los jugadores son filtrados
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    obtenerDatos(); // Llama a la función para obtener datos
  }, [firestore, id]); // Dependencias: firestore y el ID del analista

  // Maneja la selección de jugadores, alternando su inclusión/exclusión en la lista seleccionada
  const manejarSeleccionarJugador = (jugadorId) => {
    setSelectedJugadores(prevState =>
      prevState.includes(jugadorId) ? prevState.filter(id => id !== jugadorId) : [...prevState, jugadorId]
    );
  };

  // Maneja la acción de guardar las asociaciones en Firestore
  const manejarGuardarAsociaciones = async () => {
    if (analista) {
      try {
        const analistaDoc = doc(firestore, 'users', id);
        await updateDoc(analistaDoc, { asociados: selectedJugadores }); // Actualiza el documento del analista con los jugadores seleccionados
        setMostrarModalConfirmacion(true); // Muestra el modal de confirmación
      } catch (error) {
        console.error('Error guardando asociaciones:', error);
      }
    }
  };

  // Maneja el cambio en el campo de búsqueda y filtra la lista de jugadores
  const manejarCambioBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor); // Actualiza el estado del término de búsqueda
    setJugadoresFiltrados(jugadores.filter(jugador =>
      jugador.nombre.toLowerCase().includes(valor.toLowerCase())
    )); // Filtra jugadores según el término de búsqueda
  };

  return (
    <div className="contenedor-asociar-jugadores">
      <h1>Asociar Jugadores a {analista?.nombre}</h1>
      <input
        type="text"
        placeholder="Buscar jugador"
        value={busqueda}
        onChange={manejarCambioBusqueda}
        className="campo-busqueda-asociar"
      />
      <div className="lista-jugadores-asociar">
        {jugadoresFiltrados.map(jugador => (
          <div key={jugador.id} className="jugador-item-asociar">
            <p>{jugador.nombre}</p>
            <input
              type="checkbox"
              checked={selectedJugadores.includes(jugador.id)}
              onChange={() => manejarSeleccionarJugador(jugador.id)}
            />
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/gestion-usuarios')} className="boton-cancelar-asociar">Cancelar</button>
      <button onClick={manejarGuardarAsociaciones} className="boton-guardar-asociar">Guardar</button>


      {/* Modal de confirmación de asociaciones guardadas */}
      {mostrarModalConfirmacion && (
        <div className="modal-confirmacion-overlay-asociar">
          <div className="modal-confirmacion-content-asociar">
            <p>Asociaciones guardadas correctamente.</p>
            <button onClick={() => {
              setMostrarModalConfirmacion(false);
              navigate('/gestion-usuarios');
            }}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsociarJugadores;
