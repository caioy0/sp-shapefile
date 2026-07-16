import { useState, useEffect, useRef, KeyboardEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css"; // Mantido para carregar o `@import "tailwindcss"` e estilos específicos do Leaflet

// Importa o componente visual que criamos
import { Map } from "../components/Map";

// Importa os tipos
import type {
  ComarcasGeoJSON,
  ComarcaFeature,
  ComarcaProperties,
} from "../types/index.ts";

function obterCor(regiao: string | undefined): string {
  if (!regiao) return "#cccccc";
  const texto = String(regiao).toLowerCase();

  if (texto.includes("1ª")) return "#8dd3c7";
  if (texto.includes("2ª")) return "#ffffb3";
  if (texto.includes("3ª")) return "#bebada";
  if (texto.includes("4ª")) return "#fb8072";
  if (texto.includes("5ª")) return "#80b1d3";
  if (texto.includes("6ª")) return "#fdb462";
  if (texto.includes("7ª")) return "#b3de69";
  if (texto.includes("8ª")) return "#fccde5";
  if (texto.includes("9ª")) return "#d9d9d9";
  if (texto.includes("10ª")) return "#bc80bd";

  return "#cccccc";
}

function App() {
  const [dadosGlobais, setDadosGlobais] = useState<ComarcasGeoJSON | null>(null);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string>("todas");
  const [busca, setBusca] = useState<string>("");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON<ComarcaProperties> | null>(null);
  const primeiraCargaRef = useRef<boolean>(true);

  // 1. Carrega o GeoJSON
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/comarcas.json`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ao buscar comarcas.json`);
        }
        const dadosGeoJSON = (await response.json()) as ComarcasGeoJSON;
        setDadosGlobais(dadosGeoJSON);
      } catch (erro) {
        console.error("Ops! Erro ao carregar o arquivo JSON:", erro);
      }
    };
  
    carregarDados();
  }, []);

  // 2. Inicializa o mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-22.5, -48.5], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Instanciação da legenda usando classes utilitárias do Tailwind v4 através do método @utility criado no CSS
    const legenda = new L.Control({ position: "bottomright" });
    legenda.onAdd = function () {
      const div = L.DomUtil.create("div", "legend");
      const rajs = [
        "1ª RAJ",
        "2ª RAJ",
        "3ª RAJ",
        "4ª RAJ",
        "5ª RAJ",
        "6ª RAJ",
        "7ª RAJ",
        "8ª RAJ",
        "9ª RAJ",
        "10ª RAJ",
      ];
      div.innerHTML = "<h4>Regiões (RAJ)</h4>";
      for (let i = 0; i < rajs.length; i++) {
        // Classes do Tailwind aplicadas diretamente na tag <i> da legenda
        div.innerHTML += `<i class="w-4 h-4 float-left mr-2 opacity-80 rounded-[3px] border border-[#555]" style="background:${obterCor(rajs[i])}"></i> ${rajs[i]}<br>`;
      }
      return div;
    };
    legenda.addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Renderiza/Filtra as camadas de forma tipada
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !dadosGlobais) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const novaCamada = L.geoJSON<ComarcaProperties>(dadosGlobais, {
      filter: (feature) => {
        if (regiaoSelecionada === "todas") return true;
        const reg = feature.properties?.raj_sigla || feature.properties?.RAJ_SIGLA;
        return reg === regiaoSelecionada;
      },
      style: (feature) => {
        const props = feature?.properties || {};
        const reg = props.raj_sigla || props.RAJ_SIGLA || props.id_raj;
        return {
          fillColor: obterCor(reg),
          weight: 1,
          color: "#333333",
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature: ComarcaFeature, layer: L.Layer) => {
        const props = feature.properties || {};
        const nomeDaComarca = props.comarca_tjsp || props.COMARCA_TJSP || "Sem nome";

        layer.bindTooltip(`<b>Comarca:</b> ${nomeDaComarca}`, {
          sticky: true,
        });

        const pathLayer = layer as L.Path;

        layer.on("mouseover", () => {
          pathLayer.setStyle({
            fillColor: "#3b82f6",
            color: "#1d4ed8",
            weight: 3,
            fillOpacity: 0.9,
          });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            pathLayer.bringToFront();
          }
        });

        layer.on("mouseout", () => {
          novaCamada.resetStyle(pathLayer);
        });

        layer.on("click", () => {
          // O HTML interno do Popup agora utiliza totalmente classes utilitárias do Tailwind v4
          const conteudo = `
            <div class="font-sans antialiased text-slate-800">
              <div class="bg-red-600 text-white px-4 py-3.5 text-base font-semibold rounded-t-lg tracking-wide shadow-sm">
                ${nomeDaComarca}
              </div>
              
              <div class="p-3.5 border-b border-slate-100 flex flex-col gap-0.5">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🏛 Região</span>
                <strong class="text-sm text-slate-700 font-semibold">${props.raj_nome || "Não informada"}</strong>
              </div>
              
              <div class="p-3.5 border-b border-slate-100 flex flex-col gap-0.5">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📍 Circunscrição</span>
                <strong class="text-sm text-slate-700 font-semibold">${props.cj_nome || "Não informada"}</strong>
              </div>
              
              <div class="p-3.5 border-b border-slate-100 flex flex-col gap-0.5">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">👨‍⚖️ Diretor(a)</span>
                <strong class="text-sm text-slate-700 font-semibold">${props.juiz_diretor_nome || "Não informado"}</strong>
              </div>
              
              <div class="p-3.5 flex flex-col gap-0.5">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📧 E-mail</span>
                <a href="mailto:${props.juiz_diretor_email || "#"}" class="text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold transition-colors duration-150">
                  ${props.juiz_diretor_email || "-"}
                </a>
              </div>
            </div>
          `;
          layer.bindPopup(conteudo).openPopup();
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = novaCamada;

    if (primeiraCargaRef.current && novaCamada.getBounds().isValid()) {
      map.fitBounds(novaCamada.getBounds());
      primeiraCargaRef.current = false;
    }
  }, [dadosGlobais, regiaoSelecionada]);

  // 4. Mecanismo de Busca Tipado
  const handleBuscaKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const texto = busca.toLowerCase();
    const camadaGeoJSON = geojsonLayerRef.current;
    const mapa = mapRef.current;

    if (!camadaGeoJSON || !mapa) return;

    let encontrada = false;

    camadaGeoJSON.eachLayer((layer) => {
      const geoLayer = layer as L.GeoJSON & { feature: ComarcaFeature };
      const props = geoLayer.feature?.properties;
      if (!props) return;

      const nome = (
        props.comarca_tjsp ||
        props.COMARCA_TJSP ||
        ""
      ).toLowerCase();

      if (nome.includes(texto) && !encontrada) {
        const boundsLayer = layer as L.FeatureGroup;
        mapa.fitBounds(boundsLayer.getBounds());
        boundsLayer.openPopup();
        encontrada = true;
      }
    });
  };

  return (
    <Map
      mapContainerRef={mapContainerRef}
      regiaoSelecionada={regiaoSelecionada}
      setRegiaoSelecionada={setRegiaoSelecionada}
      busca={busca}
      setBusca={setBusca}
      onBuscaKeyDown={handleBuscaKeyDown}
    />
  );
}

export default App;