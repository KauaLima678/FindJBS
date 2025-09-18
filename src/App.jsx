import "./App.css";
import Radio from "./components/Dropdown";

function App() {
  return (
    <>
      <header>
        <div className="logo">
          <h1>Find<span>JBS</span></h1>
        </div>
        <div className="buttons">
          <nav>
            <a href="#" className="about">Sobre</a>
            <a href="#" className="more">Mais Projetos</a>
          </nav>
        </div>
      </header>
      <div className="body">
        <div className="mapContainer">
          {/* Aqui vai o mapa */}
          <h1>ok</h1>
        </div>
      
      <div className="inputsCont">
        <div className="input">
          <h2>Cargo</h2>
          <div className="inputContent">
          <input type="text" placeholder="Ex: Administrador" />
          </div>
        </div>
        <div className="input">
          <h2>Empresa</h2>
          <div className="inputContent">
          <input type="text" placeholder="Ex: Empresa" />
          </div>
        </div>
        <div className="dropdown">
          <h2>Ordenar</h2>
          <Radio/>
        </div>
        <div className="select">
        <h1>Modelo</h1>
          <label>
          <input type="checkbox"/> Presencial
          </label>
          <label>
          <input type="checkbox"/> Remoto
          </label>
          <label>
          <input type="checkbox"/> Híbrido
          </label>
        </div>
        </div>
      </div>
    </>
  );
}

export default App;
