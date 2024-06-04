import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import './FormularioUsuario.css';

const FormularioUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const firestore = getFirestore();
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [email, setEmail] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [genero, setGenero] = useState('');
  const [intereses, setIntereses] = useState('');
  const [biografia, setBiografia] = useState('');
  const [password, setPassword] = useState('');
  const [, setAsociados] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [selectedJugadores, setSelectedJugadores] = useState([]);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const usuarioDoc = await getDoc(doc(firestore, 'users', id));
      if (usuarioDoc.exists()) {
        const data = usuarioDoc.data();
        setUsuario(data);
        setNombre(data.nombre);
        setFechaNacimiento(data.fechaNacimiento);
        setEmail(data.email);
        setTipoUsuario(data.tipoUsuario);
        setTelefono(data.telefono || '');
        setDireccion(data.direccion || '');
        setGenero(data.genero || '');
        setIntereses(data.intereses || '');
        setBiografia(data.biografia || '');
        setAsociados(data.asociados || []);
        if (data.tipoUsuario === 'Analista') {
          const jugadoresSnapshot = await getDocs(query(collection(firestore, 'users'), where('tipoUsuario', '==', 'Jugador')));
          const listaJugadores = jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setJugadores(listaJugadores);
          setSelectedJugadores(data.asociados || []);
        }
      }
    };

    obtenerUsuario();
  }, [firestore, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usuarioRef = doc(firestore, 'users', id);
    await updateDoc(usuarioRef, {
      nombre,
      fechaNacimiento,
      email,
      tipoUsuario,
      telefono,
      direccion,
      genero,
      intereses,
      biografia,
      asociados: selectedJugadores
    });

    if (password) {
      try {
        const response = await fetch('https://us-central1-aplicacion-tactil-tfg.cloudfunctions.net/api/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: id,
            newPassword: password,
          }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error changing password:', error);
      }
    }

    navigate('/gestion-usuarios');
  };

  const manejarSeleccionarJugador = (id) => {
    setSelectedJugadores(prevState =>
      prevState.includes(id) ? prevState.filter(jId => jId !== id) : [...prevState, id]
    );
  };

  if (!usuario) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="contenedor-formulario">
      <h2>Editar Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Fecha de Nacimiento:</label>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tipo de Usuario:</label>
          <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)} required>
            <option value="Analista">Analista</option>
            <option value="Jugador">Jugador</option>
          </select>
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div>
          <label>Dirección:</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>
        <div>
          <label>Género:</label>
          <select value={genero} onChange={(e) => setGenero(e.target.value)}>
            <option value="">Seleccione</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label>Intereses:</label>
          <input
            type="text"
            value={intereses}
            onChange={(e) => setIntereses(e.target.value)}
          />
        </div>
        <div>
          <label>Biografía:</label>
          <textarea
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
          />
        </div>
        <div>
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {tipoUsuario === 'Analista' && (
          <div className="asociar-usuarios">
            <h3>Usuarios Asociados</h3>
            {jugadores.map(jugador => (
              <div key={jugador.id} className="usuario-item">
                <p>{jugador.nombre}</p>
                <input
                  type="checkbox"
                  checked={selectedJugadores.includes(jugador.id)}
                  onChange={() => manejarSeleccionarJugador(jugador.id)}
                />
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="boton-guardar">Guardar</button>
      </form>
    </div>
  );
};

export default FormularioUsuario;
