// src/components/MemoryGame/CategorySelection.js

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './CategorySelection.css';

const CategorySelection = () => {
  const [categories, setCategories] = useState([]);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(firestore, 'juegos/cartas_de_memoria');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(doc => doc.id);
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();
  }, [firestore]);

  return (
    <div className="category-selection-container">
      <h1>Cartas de memoria</h1>
      <h2>Escoge una categoría</h2>
      <div className="categories">
        {categories.map((category) => (
          <Link to={`/memory-game/${category}`} key={category} className="category-button">
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySelection;
