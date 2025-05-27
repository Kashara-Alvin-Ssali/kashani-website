import React, { useState } from 'react';
import '../css/Players.css';

const members = [
  {
    name: 'Agaba Shemus Isaac',
    role: 'President',
    image: '/images/president.jpg',
    bio: 'Shemus has led Kashani FC since 2025 with a vision for grassroots development.',
  },
  {
    name: 'Bob Akampa',
    role: 'Head Coach',
    image: '/images/coach.jpg',
    bio: 'Sarah is a licensed UEFA coach with 15+ years of experience.',
  },
  {
    name: 'SADIC NATURINDA',
    role: 'Captain',
    image: '/images/captain.jpg',
    bio: 'Sadic is a central defender known for leadership and consistency.',
  },
  {
    name: 'Kashara Alvin Ssali',
    role: 'Striker',
    image: '/images/striker.jpg',
    bio: 'Abdul has scored 10 goals this season and leads the attacking line.',
  },
  // Add more players as needed
];

const Players = () => {
  const [activeBio, setActiveBio] = useState(null);

  const toggleBio = (index) => {
    setActiveBio(activeBio === index ? null : index);
  };

  return (
    <div className="players-container">
      <h1>Meet the Team</h1>
      <p>From management to top players, get to know who powers Kashani FC.</p>

      <div className="player-grid">
        {members.map((member, index) => (
          <div className="player-card" key={index} onClick={() => toggleBio(index)}>
            <img src={member.image} alt={member.name} className="player-image" />
            <h3>{member.name}</h3>
            <p className="player-role">{member.role}</p>

            {activeBio === index && (
              <div className="player-bio">
                <p>{member.bio}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;
