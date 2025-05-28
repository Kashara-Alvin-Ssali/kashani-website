import './TeamCard.css';

function TeamCard({ image, name, title }) {
  return (
    <div className="team-card">
      <img src={image} alt={name} className="team-image" />
      <h3>{name}</h3>
      <p>{title}</p>
    </div>
  );
}

export default TeamCard;
