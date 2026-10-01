import React, { useEffect, useState } from 'react';
import { getPets } from '../../api/petfinder';
import Hero from '../../components/hero';
import Pet from '../../components/pet';
import { useParams } from 'react-router-dom';

const HomePage = () => {
  const [data, setData] = useState(null);
  const {type} = useParams(); 

  useEffect(() => {
    async function getPetsData() {
      const petsData = await getPets(type);
      setData(petsData);
    }

    getPetsData();
  }, [type]);

  if (!data) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="page">
      <Hero />
      <h3>
        <span className="pet-type-label">{type ? `${type}s` : 'Pets'}</span>{' '}
        available for adoption near you
      </h3>

      {data.length ? (
        <div className="grid">
          {data.map((animal) => (
            <Pet key={animal.id} animal={animal} />
          ))}
        </div>
      ) : (
        <p className="prompt">No {type}s available for adoption now.</p>
      )}
    </div>
  );
};

export default HomePage;
