import React from 'react';
import '../css/Management.css';

// Import your management team images from src/assets
// IMPORTANT: Replace these with your actual image filenames!
import agabaImage from '../assets/domi.jpg'; // Example: Assuming domi.jpg is for Agaba Shemus
import janeImage from '../assets/k1.jpg'; // Example: Assuming sadic.jpg is for Jane Smith
import albertImage from '../assets/logo.jpg'; // Example: Replace with an actual image for Albert K.

const management = [
  {
    name: 'Agaba Shemus Isaac',
    title: 'President',
    image: agabaImage,
    bio: 'Agaba Shemus Isaac leads Kashani FC with a vision for success and community engagement, fostering growth both on and off the field.' // Added bio
  },
  {
    name: 'Mukasa Muhammad',
    title: 'General Secretary',
    image: janeImage,
    bio: 'Muhammad oversees the strategic operations and administrative functions, ensuring efficiency and excellence in all club activities.' // Added bio
  },
  {
    name: 'Joel Taremwa.',
    title: 'Fans Representative',
    image: albertImage,
    bio: 'Joel ifronts all the concerns of the fans to the committee to ensure transparency in the team.' // Added bio
  },
  // Add more management members with their bios
];

const Management = () => {
  return (
    <div className="page-container">
      <h2>Meet The Committee</h2>
      <div className="card-grid">
        {management.map((member, index) => (
          <div key={index} className="card">
            <img src={member.image} alt={member.name} />
            <h3>{member.name}</h3>
            <p className="member-title">{member.title}</p> {/* Added class for specific styling */}
            <p className="member-bio">{member.bio}</p> {/* Added bio element */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Management;