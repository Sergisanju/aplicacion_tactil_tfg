// src/components/MemoryGame/CategorySelection.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, listAll } from "firebase/storage";

const CategorySelection = () => {
  let navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storage = getStorage();
    const categoriesRef = ref(storage, 'cartas_de_memoria');

    listAll(categoriesRef).then((res) => {
      const folders = res.prefixes.map(folderRef => {
        // Extract the category name from the folder path
        return folderRef.name;
      });
      setCategories(folders);
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching categories: ", error);
      setLoading(false);
    });
  }, []);

  const handleCategorySelect = (category) => {
    navigate(`/memory-game/${category}`);
  };

  return (
    <div>
      <h1>Cartas de memoria</h1>
      <h2>Elige una categoría</h2>
      {loading ? <p>Cargando...</p> : (
        <div>
          {categories.map((category) => (
            <button key={category} onClick={() => handleCategorySelect(category)}>
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelection;
