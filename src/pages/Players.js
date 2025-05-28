import React from 'react';
import '../css/Players.css';

const players = [
  { name: 'Alex O.', position: 'Forward', image: 'https://via.placeholder.com/150' },
  { name: 'Brian M.', position: 'Midfielder', image: 'https://via.placeholder.com/150' },
  { name: 'Chris N.', position: 'Defender', image: 'https://via.placeholder.com/150' },
  { name: 'Derrick K.', position: 'Goalkeeper', image: 'https://via.placeholder.com/150' },
  // Add more players
];

const Players = () => {
  return (
    <div className="page-container">
      <h2>Our Players</h2>
      <div className="card-grid">
        {players.map((player, index) => (
          <div key={index} className="card">
            <img src={player.image} alt={player.name} />
            <h3>{player.name}</h3>
            <p>{player.position}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;
