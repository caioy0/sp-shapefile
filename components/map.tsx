import { ChangeEvent, KeyboardEvent, RefObject } from "react";

interface MapProps {
  mapContainerRef: RefObject<HTMLDivElement | null>;
  regiaoSelecionada: string;
  setRegiaoSelecionada: (regiao: string) => void;
  busca: string;
  setBusca: (busca: string) => void;
  onBuscaKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function Map({
  mapContainerRef,
  regiaoSelecionada,
  setRegiaoSelecionada,
  busca,
  setBusca,
  onBuscaKeyDown,
}: MapProps) {
  return (
    <main className="relative w-screen h-screen">
      {/* Menu de Filtros (Posicionado por cima do mapa usando z-index e absolute) */}
      <div 
        className="absolute top-3.75 right-3.75 z-1000 bg-white p-4 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.15)] flex flex-col gap-3 w-62.5 box-border font-sans"
      >
        {/* Bloco de Entrada: Filtro por Região */}
        <div className="flex flex-col gap-1.5">
          <label 
            htmlFor="seletor-raj" 
            className="text-[11px] font-bold text-slate-500 uppercase tracking-wider"
          >
            Filtrar por Região (RAJ)
          </label>
          <select
            id="seletor-raj"
            value={regiaoSelecionada}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setRegiaoSelecionada(e.target.value)
            }
            className="px-2.5 py-2 text-sm rounded border border-slate-300 bg-white outline-none w-full box-border transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="todas">Mostrar Todas as Regiões</option>
            <option value="1ª RAJ">1ª RAJ - Grande São Paulo</option>
            <option value="2ª RAJ">2ª RAJ - Araçatuba</option>
            <option value="3ª RAJ">3ª RAJ - Bauru</option>
            <option value="4ª RAJ">4ª RAJ - Campinas</option>
            <option value="5ª RAJ">5ª RAJ - Presidente Prudente</option>
            <option value="6ª RAJ">6ª RAJ - Ribeirão Preto</option>
            <option value="7ª RAJ">7ª RAJ - Santos</option>
            <option value="8ª RAJ">8ª RAJ - São José do Rio Preto</option>
            <option value="9ª RAJ">9ª RAJ - São José dos Campos</option>
            <option value="10ª RAJ">10ª RAJ - Sorocaba</option>
          </select>
        </div>

        {/* Divisor */}
        <hr className="border-0 border-t border-slate-100 my-1 w-full" />

        {/* Bloco de Entrada: Busca */}
        <div className="flex flex-col gap-1.5">
          <label 
            htmlFor="busca-comarca" 
            className="text-[11px] font-bold text-slate-500 uppercase tracking-wider"
          >
            Buscar Comarca
          </label>
          <input
            type="text"
            id="busca-comarca"
            placeholder="🔍 Ex: Urupês..."
            value={busca}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setBusca(e.target.value)
            }
            onKeyDown={onBuscaKeyDown}
            className="px-2.5 py-2 text-sm rounded border border-slate-300 outline-none w-full box-border transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Contêiner onde o Leaflet monta o canvas */}
      <div id="meu-mapa" ref={mapContainerRef} className="w-full h-full"></div>
    </main>
  );
}