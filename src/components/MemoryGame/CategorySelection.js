import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './CategorySelection.css';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const CategorySelection = () => {
  const [categories, setCategories] = useState([]);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(firestore, 'juegos', 'cartas_de_memoria', 'categories');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(doc => doc.id);
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();
  }, [firestore]);

  const renderCategoryRows = () => {
    const rows = [];
    const itemsPerRow = 3; // Número de elementos por fila
    for (let i = 0; i < categories.length; i += itemsPerRow) {
      rows.push(
        <div className="category-row" key={i}>
          {categories.slice(i, i + itemsPerRow).map((category) => (
            <Link to={`/memory-game/${category}`} key={category} className="category-button">
              {capitalizeFirstLetter(category)}
            </Link>
          ))}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="category-selection-container">
      <h1>Cartas de memoria</h1>
      <h2>Escoge una categoría</h2>
      {categories.length > 0 ? (
        <div className="categories">
          {renderCategoryRows()}
        </div>
      ) : (
        <p>No categories found</p>
      )}
    </div>
  );
};

export default CategorySelection;
