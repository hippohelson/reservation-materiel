import { Link } from "react-router-dom";
import "./HomeButton.css";

export default function HomeButton() {
  return (
    <Link to="/" className="home-button" title="Retour à l'accueil">
      🏠
    </Link>
  );
}
