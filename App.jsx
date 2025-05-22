import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Importando CSS personalizado

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [campoFiltro, setCampoFiltro] = useState("");
  const [valorFiltro, setValorFiltro] = useState("");
  const [opcoesFiltro, setOpcoesFiltro] = useState([]);

  useEffect(() => {
    // Buscar usuários da API e garantir que todos tenham ID
    axios.get("https://jsonplaceholder.typicode.com/users")
      .then((res) => {
        // Garantir que todos os usuários tenham ID
        const usuariosComId = res.data.map((usuario, index) => {
          // Se o usuário não tiver ID, atribuir um baseado no índice
          if (!usuario.id) {
            return { ...usuario, id: index + 1 };
          }
          return usuario;
        });
        setUsuarios(usuariosComId);
      })
      .catch((err) => console.error("Erro ao buscar usuários:", err));
  }, []);

  const camposDisponiveis = [
    { label: "Nome", value: "name" },
    { label: "Email", value: "email" },
    { label: "Usuário", value: "username" },
    { label: "Telefone", value: "phone" },
    { label: "Site", value: "website" },
    { label: "Cidade", value: "address.city" },
    { label: "Empresa", value: "company.name" }
  ];

  // Função getValor melhorada para lidar com campos aninhados de forma mais robusta
  const getValor = (obj, caminho) => {
    if (!obj || !caminho) return "";
    try {
      return caminho.split('.').reduce((acc, parte) => {
        return acc && acc[parte] !== undefined ? acc[parte] : "";
      }, obj);
    } catch (error) {
      console.error("Erro ao acessar propriedade:", error);
      return "";
    }
  };

  useEffect(() => {
    if (!campoFiltro) {
      setOpcoesFiltro([]);
      return;
    }

    // Obter valores únicos e filtrar valores vazios ou undefined
    const valoresUnicos = [...new Set(
      usuarios
        .map((u) => getValor(u, campoFiltro))
        .filter(valor => valor !== undefined && valor !== null && valor !== "")
    )];
    
    // Ordenar valores para melhor experiência do usuário
    valoresUnicos.sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
      }
      return String(a).localeCompare(String(b));
    });
    
    setOpcoesFiltro(valoresUnicos);
    setValorFiltro("");
  }, [campoFiltro, usuarios]);

  const filtrarUsuarios = () => {
    if (!campoFiltro || !valorFiltro) return usuarios;

    return usuarios.filter((usuario) => {
      const valorCampo = getValor(usuario, campoFiltro);
      // Comparação mais robusta para evitar problemas com tipos diferentes
      return valorCampo !== "" && String(valorCampo) === String(valorFiltro);
    });
  };

  // Obter os usuários filtrados para uso na renderização
  const usuariosFiltrados = filtrarUsuarios();

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-5 fw-bold">📊 Painel Interativo de Usuários</h1>

      <div className="row justify-content-center g-3 mb-4 align-items-center">
        {/* Botão "Mostrar Todos" */}
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

        {/* Campo para selecionar o tipo de filtro */}
        <div className="col-6 col-md-3">
          <label htmlFor="campoFiltro" className="form-label visually-hidden">Filtrar por</label>
          <select
            id="campoFiltro"
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

        {/* Campo com valores únicos, aparece dinamicamente */}
        {opcoesFiltro.length > 0 && (
          <div className="col-6 col-md-3">
            <label htmlFor="valorFiltro" className="form-label visually-hidden">Valor</label>
            <select
              id="valorFiltro"
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

      {/* Container padronizado para listagem de usuários */}
      <div className="user-container">
        {/* Mensagem quando não há resultados */}
        {usuariosFiltrados.length === 0 && (
          <div className="no-results">
            <h4 className="text-muted">Nenhum usuário encontrado com os filtros selecionados.</h4>
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
            <div className="user-card" key={usuario.id || `temp-${Math.random()}`}>
              <div className="card shadow rounded-4 h-100 border-0">
                <div className="card-body">
                  <h5 className="card-title fw-semibold text-primary">{usuario.name}</h5>
                  <p className="card-text small">
                    <strong>Usuário:</strong> {usuario.username} <br />
                    <strong>Email:</strong> {usuario.email} <br />
                    <strong>Telefone:</strong> {usuario.phone} <br />
                    <strong>Site:</strong> <a href={`http://${usuario.website}`} target="_blank" rel="noreferrer">{usuario.website}</a><br />
                    <strong>Empresa:</strong> {usuario.company?.name || "N/A"} <br />
                    <strong>Cidade:</strong> {usuario.address?.city || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé simples */}
      <footer className="text-center mt-5 text-muted small">
        Desenvolvido com ❤️
      </footer>
    </div>
  );
}

export default App;
