import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [campoFiltro, setCampoFiltro] = useState("");
  const [valorFiltro, setValorFiltro] = useState("");
  const [opcoesFiltro, setOpcoesFiltro] = useState([]);
  // Estado para controlar quais usuários têm dados revelados
  const [usuariosRevelados, setUsuariosRevelados] = useState({});

  // Buscar usuários da API
  useEffect(() => {
    axios.get("https://jsonplaceholder.typicode.com/users")
      .then((res) => {
        // Garantir IDs para todos os usuários
        const usuariosComId = res.data.map((usuario, index) => 
          usuario.id ? usuario : { ...usuario, id: index + 1 }
        );
        setUsuarios(usuariosComId);
      })
      .catch((err) => console.error("Erro:", err));
  }, []);

  // Campos disponíveis para filtro
  const camposDisponiveis = [
    { label: "Nome", value: "name" },
    { label: "Email", value: "email" },
    { label: "Usuário", value: "username" },
    { label: "Telefone", value: "phone" },
    { label: "Site", value: "website" },
    { label: "Cidade", value: "address.city" },
    { label: "Empresa", value: "company.name" }
  ];

  // Função para acessar propriedades aninhadas
  const getValor = (obj, caminho) => {
    if (!obj || !caminho) return "";
    try {
      return caminho.split('.').reduce((acc, parte) => 
        acc && acc[parte] !== undefined ? acc[parte] : "", obj);
    } catch {
      return "";
    }
  };

  // Atualizar opções de filtro quando o campo muda
  useEffect(() => {
    if (!campoFiltro) {
      setOpcoesFiltro([]);
      return;
    }
    
    // Obter valores únicos, filtrar vazios e ordenar
    const valoresUnicos = [...new Set(
      usuarios
        .map(u => getValor(u, campoFiltro))
        .filter(valor => valor)
    )].sort((a, b) => String(a).localeCompare(String(b)));
    
    setOpcoesFiltro(valoresUnicos);
    setValorFiltro("");
  }, [campoFiltro, usuarios]);

  // Filtrar usuários com base nos critérios selecionados
  const usuariosFiltrados = !campoFiltro || !valorFiltro 
    ? usuarios 
    : usuarios.filter(usuario => 
        String(getValor(usuario, campoFiltro)) === String(valorFiltro));

  // Alternar revelação de dados do usuário com duplo clique
  const alternarRevelacao = (id) => {
    setUsuariosRevelados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Mascarar texto para exibição oculta
  const mascarar = (texto) => {
    return texto ? "*".repeat(Math.min(texto.length, 8)) : "";
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-5 fw-bold">📊 Painel Interativo de Usuários</h1>

      {/* Controles de filtro */}
      <div className="row justify-content-center g-3 mb-4 align-items-center">
        <div className="col-auto">
          <button
            className="btn btn-outline-dark"
            onClick={() => {
              setCampoFiltro("");
              setValorFiltro("");
            }}
          >
            Mostrar Todos
          </button>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={campoFiltro}
            onChange={(e) => setCampoFiltro(e.target.value)}
          >
            <option value="">Filtrar por...</option>
            {camposDisponiveis.map((campo) => (
              <option key={campo.value} value={campo.value}>{campo.label}</option>
            ))}
          </select>
        </div>

        {opcoesFiltro.length > 0 && (
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={valorFiltro}
              onChange={(e) => setValorFiltro(e.target.value)}
            >
              <option value="">Escolha um valor...</option>
              {opcoesFiltro.map((valor, idx) => (
                <option key={idx} value={valor}>{valor}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Listagem de usuários */}
      <div className="user-container">
        {/* Mensagem quando não há resultados */}
        {usuariosFiltrados.length === 0 && (
          <div className="no-results">
            <h4 className="text-muted">Nenhum usuário encontrado</h4>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => {
                setCampoFiltro("");
                setValorFiltro("");
              }}
            >
              Limpar Filtros
            </button>
          </div>
        )}
        
        {/* Grid de cartões de usuários */}
        <div className="user-grid">
          {usuariosFiltrados.map((usuario) => (
            <div className="user-card" key={usuario.id}>
              <div className="card shadow rounded-4 h-100 border-0">
                <div className="card-body">
                  {/* Nome com duplo clique para revelar dados */}
                  <h5 
                    className="card-title fw-semibold text-primary"
                    onDoubleClick={() => alternarRevelacao(usuario.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {usuario.name}
                  </h5>
                  
                  <p className="card-text small">
                    <strong>Usuário:</strong> {usuariosRevelados[usuario.id] ? usuario.username : mascarar(usuario.username)} <br />
                    <strong>Email:</strong> {usuariosRevelados[usuario.id] ? usuario.email : mascarar(usuario.email)} <br />
                    <strong>Telefone:</strong> {usuariosRevelados[usuario.id] ? usuario.phone : mascarar(usuario.phone)} <br />
                    <strong>Site:</strong> {usuariosRevelados[usuario.id] 
                      ? <a href={`http://${usuario.website}`} target="_blank" rel="noreferrer">{usuario.website}</a>
                      : mascarar(usuario.website)}<br />
                    <strong>Empresa:</strong> {usuariosRevelados[usuario.id] 
                      ? (usuario.company?.name || "N/A") 
                      : mascarar(usuario.company?.name)} <br />
                    <strong>Cidade:</strong> {usuariosRevelados[usuario.id] 
                      ? (usuario.address?.city || "N/A") 
                      : mascarar(usuario.address?.city)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
