import "leaflet/dist/leaflet.css";
import "./App.css";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import Radio from "./components/Dropdown";
import MapSelector from "./components/MapSelector";
import { IoLocationSharp } from "react-icons/io5";
import { MdOutlineLaptopChromebook } from "react-icons/md";
import { BiBuildings } from "react-icons/bi";
import Loading from "./components/Spinner";
import ScrollReveal from "scrollreveal";

function App() {
  const [about, setAbout] = useState(false);
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
  const [searchLocation, setSearchLocation] = useState(""); // Para controlar o estado de "carregando"
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
      setVagas(response.data.jobs || []);
      setSearchLocation(response.data.searchLocation); // Armazenamos os resultados no estado
    } catch (error) {
      console.error("Erro ao buscar vagas:", error);
      alert("Não foi possível buscar as vagas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(vagas.length > 0){
    ScrollReveal().reveal(".jobCard", {
      duration: 1000,
      distance: "50px",
      origin: "bottom",
      easing: "ease",
      interval: 300,
      reset: false,
    });
  }
  }, [vagas]);

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
            <a href="#" className="about" onClick={() => setAbout(true)}>
              Sobre
            </a>
            <a
              href="https://github.com/KauaLima678"
              target="_blank"
              className="more"
            >
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
              {isLoading ? <Loading /> : "Buscar"}
            </button>
          </div>
        </div>
        <div className="resultsJob">
          {vagas.length > 0 && (
            <h2 className="jobTitleSection">{`Vagas encontradas (${vagas.length})`}</h2>
          )}
          <div className="jobList">
            {vagas.map((vaga) => (
              <div className="jobCard" key={vaga.id}>
                <div className="content">
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
                      <span>
                        {vaga.modelo.charAt(0).toUpperCase() +
                          vaga.modelo.slice(1)}
                      </span>
                    </span>
                  </div>
                  <a
                    href={vaga.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buttonMore"
                  >
                    Ver vaga
                  </a>
                </div>
              </div>
            ))}
          </div>
            {vagas.length > 0 && (
                    <div className="showMore" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <a style={{color: 'rgb(0, 187, 255)', textDecoration: 'none', fontSize: '18px '}} href={`https://portal.gupy.io/job-search/term=${filters.cargo}`} target="_blank">Ver mais</a>
        </div>
            )}
      </div>
        </div>
      {about && (
        <div className="overlay" onClick={() => setAbout(false)}>
          <div className="container" onClick={(e) => e.stopPropagation()}>
            <div className="content">
              <h1>Sobre a FindJBS: Mapeando oportunidades</h1>
              <p>
                A busca por um novo emprego pode, muitas vezes, parecer um
                labirinto. Navegamos por listas intermináveis, filtros confusos
                e descrições que nem sempre nos dão uma noção clara de onde a
                oportunidade realmente está. A conexão entre a vaga e sua
                localização no mundo real quase sempre se perde em meio a tantos
                dados.{" "}
              </p>
              <h1>Nossa Missão</h1>
              <p>
                Nossa missão é simples: transformar a busca por emprego em uma
                experiência interativa, visual e geograficamente inteligente.
                Acreditamos que, ao posicionar as oportunidades em um mapa,
                podemos oferecer aos profissionais uma perspectiva única e
                poderosa sobre o mercado de trabalho em sua região, ajudando-os
                a tomar decisões mais informadas sobre suas carreiras.
              </p>

              <h1>Como Funciona?</h1>
              <p>
                A FindJBS é uma aplicação web moderna construída com tecnologia
                de ponta. A interface que você utiliza foi desenvolvida em
                React.js, garantindo uma experiência de usuário rápida e fluida.
                O coração do nosso sistema reside em um backend robusto criado
                com Node.js, que orquestra uma série de operações complexas: Ele
                interpreta a área do mapa que você está explorando. Utiliza APIs
                de geolocalização reversa para "traduzir" as coordenadas
                geográficas em nomes de cidades e estados. Conecta-se em tempo
                real a APIs de vagas externas, buscando por oportunidades que
                correspondam aos seus critérios e à localização desejada. Por
                fim, ele envia esses dados de volta para a sua tela,
                posicionando cada vaga encontrada no mapa.
              </p>

              <h1>O criador</h1>
              <p>
                A FindJBS é um projeto de portfólio idealizado e desenvolvido
                por <span>Kauã Lima</span>, um desenvolvedor apaixonado por
                criar soluções que resolvem problemas do mundo real através da
                tecnologia. Este projeto é uma demonstração prática de
                habilidades em desenvolvimento full-stack, resiliência na
                resolução de problemas e a capacidade de integrar e orquestrar
                múltiplas tecnologias e APIs complexas para criar uma
                experiência de usuário coesa e funcional.
              </p>

              <p>
                O que você vê hoje é o resultado de uma longa jornada de
                desenvolvimento, testes e refinamentos, com o objetivo de
                entregar não apenas um código, mas uma ferramenta
                verdadeiramente útil.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
