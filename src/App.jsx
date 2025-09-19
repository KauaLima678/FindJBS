import "leaflet/dist/leaflet.css";
import "./App.css";
import axios from "axios";
import { useState, useRef } from "react";
import Radio from "./components/Dropdown";
import MapSelector from "./components/MapSelector";
import { IoLocationSharp } from "react-icons/io5";
import { MdOutlineLaptopChromebook } from "react-icons/md";
import { BiBuildings } from "react-icons/bi";

function App() {
  const [filters, setFilters] = useState({
    cargo: "",
    empresa: "",
    ordenarPor: "Mais Recentes",
    modelo: {
      presencial: false,
      remoto: false,
      hibrido: false,
    },
  });
  const [vagas, setVagas] = useState([]); // Para armazenar os resultados da busca
  const [isLoading, setIsLoading] = useState(false); // Para controlar o estado de "carregando"
  const mapRef = useRef(null); // Para termos acesso ao mapa

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Função para lidar com as checkboxes de modelo de trabalho
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      modelo: { ...prev.modelo, [name]: checked },
    }));
  };

  // Função para limpar todos os campos
  const handleClear = () => {
    setFilters({
      cargo: "",
      empresa: "",
      ordenarPor: "Mais Recentes",
      modelo: { presencial: false, remoto: false, hibrido: false },
    });
    setVagas([]); // Limpa os resultados também
  };

  const handleSearch = async () => {
    if (!mapRef.current) return;
    setIsLoading(true);
    setVagas([]); // Limpa vagas anteriores

    const bounds = mapRef.current.getBounds();
    

    const params = {
      neLat: bounds.getNorthEast().lat,
      neLng: bounds.getNorthEast().lng,
      swLat: bounds.getSouthWest().lat,
      swLng: bounds.getSouthWest().lng,
      ...filters,
      modelo: JSON.stringify(filters.modelo), // Convertemos o objeto para string
    };

    try {
      const response = await axios.get("http://localhost:3001/api/vagas", {
        params,
      });
      setVagas(response.data); // Armazenamos os resultados no estado
    } catch (error) {
      console.error("Erro ao buscar vagas:", error);
      alert("Não foi possível buscar as vagas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header>
        <div className="logo">
          <h1>
            Find<span>JBS</span>
          </h1>
        </div>
        <div className="nav">
          <nav>
            <a href="#" className="about">
              Sobre
            </a>
            <a href="#" className="more">
              Mais Projetos
            </a>
          </nav>
        </div>
      </header>
      <div className="body">
        <div className="mapContainer">
          <MapSelector ref={mapRef} />
        </div>
        <div className="search">
          <div className="inputsCont">
            <div className="input">
              <h2>Cargo</h2>
              <div className="inputContent">
                <input
                  type="text"
                  name="cargo"
                  placeholder="Ex: Administrador"
                  value={filters.cargo}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="input">
              <h2>Empresa</h2>
              <div className="inputContent">
                <input
                  type="text"
                  placeholder="Ex: Empresa"
                  name="empresa"
                  value={filters.empresa}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="dropdown">
              <h2>Ordenar por</h2>
              <select
                name="ordenarPor"
                id="OrderBy"
                value={filters.ordenarPor}
                onChange={handleInputChange}
              >
                <option value="Mais Recentes">Mais recente</option>
                <option value="menosRecente">Menos recente</option>
              </select>
            </div>
            <div className="select">
              <h1>Modelo</h1>
              <div className="selects">
                <label>
                  <input
                    type="checkbox"
                    name="presencial"
                    onChange={handleCheckboxChange}
                    checked={filters.modelo.presencial}
                  />{" "}
                  Presencial
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="remoto"
                    onChange={handleCheckboxChange}
                    checked={filters.modelo.remoto}
                  />{" "}
                  Remoto
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={handleCheckboxChange}
                    checked={filters.modelo.hibrido}
                    name="hibrido"
                  />{" "}
                  Híbrido
                </label>
              </div>
            </div>
          </div>
          <div className="buttons">
            <button className="clear" onClick={handleClear}>
              Limpar Campos
            </button>
            <button
              className="fetch"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>
        <div className="resultsJob">
          {vagas.length > 0 && <h2 className="jobTitleSection">{`Vagas encontradas (${vagas.length})`}</h2>}
          <div className="jobList">
            {vagas.map((vaga) => (
              <div className="jobCard" key={vaga.id}>
                <div className="headerCard">
                  {vaga.logoUrl && (
                    <img
                      src={vaga.logoUrl}
                      alt={`Logo da empresa ${vaga.empresa}`}
                      className="logo"
                    />
                  )}
                  <p> {vaga.empresa}</p>
                </div>
                <h3>{vaga.titulo}</h3>

                <div className="infos">
                  <span className="item">
                    <IoLocationSharp /> {vaga.localizacao}
                  </span>
                  <span className="item">
                    {vaga.modelo === "presencial" && (
                      <BiBuildings title="Presencial" />
                    )}
                    {(vaga.modelo === "remoto" ||
                      vaga.modelo === "hibrido") && (
                      <MdOutlineLaptopChromebook title={vaga.modelo} />
                    )}
                     <span>{vaga.modelo.charAt(0).toUpperCase() + vaga.modelo.slice(1)}</span>
                  </span>
                </div>
                <a href={vaga.url} target="_blank" rel="noopener noreferrer" className="buttonMore">
                  Ver vaga
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
