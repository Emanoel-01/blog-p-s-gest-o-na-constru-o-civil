import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SlideCycles({ isAdmin }) {
  const accordionContainerRef = useRef(null);
  const [cyclesData, setCyclesData] = useState([
    { name: 'Ciclo I: Gestão de Projetos e Obras', hours: 120, disciplines: ['Gerenciamento de Projetos', 'Eficiência Energética e Sustentabilidade na Construção Civil', 'Técnicas de Compatibilização de Projetos', 'Técnicas de Orçamentos, Cobranças e Custos de Projetos e Obras', 'Técnicas de Planejamento e Coordenação de Obras', 'Técnicas de Gestão da Qualidade e Indicadores de Produtividade em Obras'] },
    { name: 'Ciclo II: Tecnologia na Construção Civil', hours: 100, disciplines: ['Tecnologias aplicadas à Compatibilização de Projetos', 'Tecnologias aplicadas a Orçamentos, Cobranças e Custos de Projetos e Obras', 'Tecnologias aplicadas a Planejamento e Coordenação de Obras', 'Tecnologias aplicadas à Gestão da Qualidade e Indicadores de Produtividade em Obras', 'Prática Simulada Avançada: Inteligência Artificial aplicada na Gestão de Projetos e Obras'] },
    { name: 'Ciclo III: Gestão e Empreendedorismo na Construção Civil', hours: 80, disciplines: ['Gestão Estratégica e Empreendedorismo: Liderança, Administração e Marketing', 'Prática Simulada: Questões Jurídicas, Trabalhistas e Contábeis', 'Técnicas de Negociação e Vendas para Arquitetos e Engenheiros', 'Prática Simulada: Licitações Públicas e Contratos Administrativos'] },
    { name: 'Ciclo IV: Engenharia Diagnóstica e Avaliação de Imóveis', hours: 80, disciplines: ['Avaliação de Edificações Urbanas e Rurais', 'Engenharia Diagnóstica: Patologias das Edificações', 'Elaboração de Laudos Técnicos, Periciais e Judiciais', 'Estratégias de Negócios e Vendas de Laudos para o Judiciário e Bancos'] }
  ]);
  const [currentlyEditing, setCurrentlyEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const newCycleNameRef = useRef(null);
  const newCycleHoursRef = useRef(null);

  const boxColors = [
    'bg-blue-50 border-blue-200', 'bg-green-50 border-green-200', 'bg-indigo-50 border-indigo-200',
    'bg-pink-50 border-pink-200', 'bg-yellow-50 border-yellow-200', 'bg-purple-50 border-purple-200'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentlyEditing !== null) {
      const item = accordionContainerRef.current?.querySelector(`.accordion-item[data-index='${currentlyEditing}']`);
      if (item) {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        if (header && content) {
          header.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
          const chevronIcon = header.querySelector('.chevron-icon');
          if (chevronIcon) chevronIcon.classList.add('rotate-180');
        }
      }
    }
  }, [currentlyEditing, cyclesData]);

  const saveData = (data) => {
    localStorage.setItem('esudaCyclesData', JSON.stringify(data));
    setCyclesData(data);
    toast.success("Ciclos salvos com sucesso!");
  };

  const loadData = () => {
    const savedCycles = localStorage.getItem('esudaCyclesData');
    if (savedCycles) {
      setCyclesData(JSON.parse(savedCycles));
    }
  };

  const handleAddCycle = () => {
    const name = newCycleNameRef.current.value.trim();
    const hours = parseInt(newCycleHoursRef.current.value, 10);
    if (name && hours > 0) {
      saveData([...cyclesData, { name, hours, disciplines: [] }]);
      newCycleNameRef.current.value = '';
      newCycleHoursRef.current.value = '';
      setShowAddForm(false);
    } else {
      toast.error('Por favor, preencha o nome e a carga horária do ciclo.');
    }
  };

  const handleEditClick = (index, e) => {
    e.stopPropagation();
    setCurrentlyEditing(index);
  };

  const handleSaveEdit = (index) => {
    const item = accordionContainerRef.current?.querySelector(`.accordion-item[data-index='${index}']`);
    if (!item) return;

    const newName = item.querySelector('.edit-cycle-name').value.trim();
    const newHours = parseInt(item.querySelector('.edit-cycle-hours').value, 10);
    const newDisciplinesText = item.querySelector('.edit-cycle-disciplines').value;
    const newDisciplines = newDisciplinesText.split('\n').map(d => d.trim()).filter(d => d);

    if (newName && newHours > 0) {
      const updatedCycles = [...cyclesData];
      updatedCycles[index] = { name: newName, hours: newHours, disciplines: newDisciplines };
      saveData(updatedCycles);
      setCurrentlyEditing(null);
    } else {
      toast.error('Nome e carga horária são obrigatórios.');
    }
  };

  const handleCancelEdit = () => {
    setCurrentlyEditing(null);
  };

  const handleAccordionToggle = (e) => {
    if (currentlyEditing !== null) return;

    const header = e.target.closest('.accordion-header');
    if (!header) return;

    const item = header.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');

    const isOpen = header.classList.contains('open');

    accordionContainerRef.current.querySelectorAll('.accordion-header').forEach(h => {
      if (h !== header) {
        h.classList.remove('open');
        h.nextElementSibling.style.maxHeight = null;
        h.querySelector('.chevron-icon')?.classList.remove('rotate-180');
      }
    });

    if (!isOpen) {
      header.classList.add('open');
      content.style.maxHeight = content.scrollHeight + "px";
      header.querySelector('.chevron-icon')?.classList.add('rotate-180');
    } else {
      header.classList.remove('open');
      content.style.maxHeight = null;
      header.querySelector('.chevron-icon')?.classList.remove('rotate-180');
    }
  };

  return (
    <div className="slide-content max-h-[75vh] overflow-y-auto pr-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">
          Nossos Ciclos de Conhecimento
        </h2>
        {isAdmin && (
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm">
            {showAddForm ? 'Cancelar' : '+ Incluir Ciclo'}
          </Button>
        )}
      </div>
      <p className="text-gray-600 mb-6">
        {isAdmin ? 'Suas alterações são salvas automaticamente. Clique em um ciclo para ver/editar as disciplinas.' : 'Clique em um ciclo para ver as disciplinas.'}
      </p>

      {isAdmin && showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Adicionar Novo Ciclo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" ref={newCycleNameRef} placeholder="Nome do Ciclo" className="p-2 border rounded-md w-full" />
            <input type="number" ref={newCycleHoursRef} placeholder="Carga Horária (h)" className="p-2 border rounded-md w-full" />
          </div>
          <div className="mt-4 flex gap-4">
            <Button onClick={handleAddCycle} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Salvar Ciclo
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div ref={accordionContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onClick={handleAccordionToggle}>
        {cyclesData.map((cycle, index) => {
          const colorClass = boxColors[index % boxColors.length];
          const isCurrentlyEditing = currentlyEditing === index;

          return (
            <div key={index} className={`accordion-item rounded-xl shadow-lg border ${colorClass}`} data-index={index}>
              <button
                className={`accordion-header w-full text-left p-4 flex justify-between items-center transition duration-300 rounded-t-xl hover:bg-black/5 ${isCurrentlyEditing ? 'open' : ''}`}
                aria-expanded={isCurrentlyEditing}
              >
                <span className="font-semibold text-gray-800 flex-1 pr-2">{cycle.name} ({cycle.hours}h)</span>
                <div className="flex items-center">
                  {isAdmin && (
                    <span onClick={(e) => handleEditClick(index, e)} className="edit-icon mr-2 cursor-pointer">
                      <svg className="w-5 h-5 text-gray-500 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                    </span>
                  )}
                  <svg className={`chevron-icon w-5 h-5 transform transition-transform duration-300 shrink-0 ${isCurrentlyEditing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </button>
              <div className="accordion-content bg-white rounded-b-xl" style={{ maxHeight: isCurrentlyEditing ? 'none' : null }}>
                {isCurrentlyEditing ? (
                  <div className="p-4 bg-gray-50 space-y-3">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b">
                      <h4 className="text-md font-semibold text-gray-700">Editando Ciclo</h4>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleSaveEdit(index)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md flex items-center justify-center gap-1 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                          <span>Salvar</span>
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-md flex items-center justify-center gap-1 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                          <span>Cancelar</span>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome do Ciclo</label>
                      <input type="text" defaultValue={cycle.name} className="edit-cycle-name w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Carga Horária (h)</label>
                      <input type="number" defaultValue={cycle.hours} className="edit-cycle-hours w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Disciplinas (uma por linha)</label>
                      <textarea defaultValue={cycle.disciplines.join('\n')} className="edit-cycle-disciplines w-full p-2 border rounded-md mt-1" rows="5"></textarea>
                    </div>
                  </div>
                ) : (
                  <ul className="p-4 pt-2 text-gray-700 list-disc list-inside space-y-2 text-sm">
                    {cycle.disciplines && cycle.disciplines.length > 0 ? (
                      cycle.disciplines.map((d, i) => <li key={i}>{d}</li>)
                    ) : (
                      <p className="p-4 pt-2 text-sm text-gray-500 italic">Nenhuma disciplina lançada.</p>
                    )}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <div className="mt-8">
          <Button onClick={() => saveData(cyclesData)} className="save-all-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            Salvar (Confirmação)
          </Button>
        </div>
      )}
    </div>
  );
}