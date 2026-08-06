// src/components/pages/Root.jsx
import { Outlet, NavLink } from "react-router-dom";
import Alert from "../Alert/Alert";
import { useContext } from "react";
import { MessageContext } from "../../context/MessageContext";

export default function Root() {
  console.log("Executed Root.jsx")
  const owner = 'Nicolas Figueroa Hidalgo'

  const { message } = useContext(MessageContext);

  return (
    <div className="App">
      <NavLink 
        to="/" 
        className={ ({ isActive }) => isActive? 'activeLink' : 'Link'}
        >Create New Playlists</NavLink>
      <NavLink 
        to={`playlists/:${owner}`} 
        className={ ({ isActive }) => isActive? 'activeLink' : 'Link'}
        >Current User Playlists</NavLink>
      <h1>Jammming</h1>
      <h2>(Spotify Edition)</h2>
      {message && <Alert type={message.type} text={message.text} />}
      <Outlet />
      <footer>
        <p>Provided with support of the Spotify Web API</p>
      </footer>
    </div>
  );
}
