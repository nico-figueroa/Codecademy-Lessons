import React from 'react';

const Hero = ({ image, displayText }) => {
  const type = ''

  return (
    <div className="hero-container">
      <img
        className="hero-image"
        src={image || '/pets-hero.png'}
        onError={(event) => {
          event.currentTarget.src = '/pets-hero.png';
        }}
        alt=""
      />
      <h2>{displayText || getHeroTitle(type)}</h2>
    </div>
  );
};

export default Hero;

const getHeroTitle = (type) => {
  switch (type) {
    case 'dog':
      return 'Dogs';
    case 'cat':
      return 'Cats';
    case 'rabbit':
      return 'Rabbits';
    case 'bird':
      return 'Birds';
    default:
      return 'Find your perfect pet';
  }
};
