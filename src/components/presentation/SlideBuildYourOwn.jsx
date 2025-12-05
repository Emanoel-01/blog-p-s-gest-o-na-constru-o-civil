import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SlideBuildYourOwn({ isAdmin }) {
  const [cyclesData, setCyclesData] = useState([]);
  const [customSpecializations, setCustomSpecializations] = useState([]);

  const newPosNameRef = useRef(null);
  const newPosHoursRef = useRef(null);
  const sumByCyclesCheckboxRef = useRef(null);

  const [showAddPosForm, setShowAddPosForm] = useState(false);
  const [currentPosStep, setCurrentPosStep] = useState(1);
  const [selectedCycles, setSelectedCycles] = useState([]);
  const [selectedHoursTotal, setSelectedHoursTotal] = useState(0);
  const [targetHours, setTargetHours] = useState(0);
  const [isSumByCycles, setIsSumByCycles] = useState(false);

  useEffect(() => {
    const savedCycles = localStorage.getItem('esudaCyclesData');
    if (savedCycles) {
      setCyclesData(JSON.parse(savedCycles));
    }

    const savedSpecializations = localStorage.getItem('esudaCustomSpecializations');
    if (savedSpecializations) {
      setCustomSpecializations(JSON.parse(savedSpecializations));
    }
  }, []);

  useEffect(() => {
    let total = 0;
    const currentCyclesMap = new Map(cyclesData.map(c => [c.name, c.hours]));
    selectedCycles.forEach(cycleName => {
      total += currentCyclesMap.get(cycleName) || 0;
    });
    setSelectedHoursTotal(total);
  }, [selectedCycles, cyclesData]);

  const saveData = (customSpecs) => {
    localStorage.setItem('esudaCustomSpecializations', JSON.stringify(customSpecs));
    setCustomSpecializations(customSpecs);
    toast.success("Especialização salva com sucesso!");
  };

  const resetPosForm = () => {
    setShowAddPosForm(false);
    setCurrentPosStep(1);
    if (newPosNameRef.current) newPosNameRef.current.value = '';
    if (newPosHoursRef.current) newPosHoursRef.current.value = '';
    if (sumByCyclesCheckboxRef.current) sumByCyclesCheckboxRef.current.checked = false;
    setSelectedCycles([]);
    setSelectedHoursTotal(0);
    setTargetHours(0);
    setIsSumByCycles(false);
  };

  const handleSumByCyclesChange = (e) => {
    const checked = e.target.checked;
    setIsSumByCycles(checked);
    if (newPosHoursRef.current) {
      newPosHoursRef.current.disabled = checked;
      if (checked) newPosHoursRef.current.value = '';
    }
  };

  const handlePosNextStep = () => {
    const name = newPosNameRef.current?.value.trim();
    const hours = parseInt(newPosHoursRef.current?.value, 10);

    if (!name) {
      toast.error('Por favor, informe o nome da especialização.');
      return;
    }
    if (!isSumByCycles && (!hours || hours <= 0)) {
      toast.error('Por favor, defina a carga horária total ou marque a opção para somar pelos ciclos.');
      return;
    }

    setTargetHours(isSumByCycles ? 360 : hours);
    setCurrentPosStep(2);
    setSelectedCycles([]);
  };

  const handleCycleCheckboxChange = (e) => {
    const cycleName = e.target.value;
    setSelectedCycles(prev =>
      e.target.checked ? [...prev, cycleName] : prev.filter(name => name !== cycleName)
    );
  };

  const validateSelection = () => {
    if (isSumByCycles) {
      return selectedHoursTotal >= 360;
    } else {
      return selectedHoursTotal === targetHours;
    }
  };

  const handleSavePos = () => {
    if (!validateSelection()) {
      toast.error('A carga horária selecionada não corresponde aos requisitos.');
      return;
    }

    const name = newPosNameRef.current?.value.trim();
    if (!name) {
        toast.error('Nome da especialização não pode ser vazio.');
        return;
    }

    const newSpecialization = { name, totalHours: selectedHoursTotal, cycles: selectedCycles };
    saveData([...customSpecializations, newSpecialization]);
    resetPosForm();
  };

  return (
    <div className="slide-content max-h-[75vh] overflow-y-auto pr-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Monte sua Especialização</h2>
      <p className="text-gray-600 mb-6">
        Uma especialização completa é formada pela combinação de ciclos que somam, no mínimo, 360 horas.
        Escolha os ciclos que mais interessam a você!
      </p>

      <div className="space-y-6 mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Especialização em Gestão de Projetos e Obras (380h)</h3>
          <p className="text-blue-700"><strong>Ciclos:</strong> Gestão de Projetos e Obras + Tecnologia em Projetos e Obras + Gestão e Empreendedorismo + Eng. Diagnóstica.</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
          <h3 className="text-xl font-bold text-green-800 mb-2">Especialização em Manutenção Predial 4.0 (360h)</h3>
          <p className="text-green-700"><strong>Ciclos:</strong> Fundamentos da Manutenção + Tecnologia em Manutenção 4.0 + Eng. Condominial + Gestão e Empreendedorismo + Eng. Diagnóstica.</p>
        </div>

        {customSpecializations.map((spec, index) => (
          <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
            <h3 className="text-xl font-bold text-yellow-800 mb-2">Especialização em {spec.name} ({spec.totalHours}h)</h3>
            <p className="text-yellow-700"><strong>Ciclos:</strong> {spec.cycles.join(' + ')}.</p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="mt-8">
          <Button onClick={() => setShowAddPosForm(!showAddPosForm)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            {showAddPosForm ? 'Cancelar Nova Pós' : '+ Criar Nova Pós-Graduação'}
          </Button>

          {showAddPosForm && (
            <div className="bg-yellow-50 p-6 rounded-lg mt-4 border border-yellow-200">
              {currentPosStep === 1 && (
                <div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-4">Criar Nova Especialização</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700">Nome da Especialização</label>
                      <div className="flex items-center mt-1">
                        <span className="bg-gray-200 p-2 rounded-l-md text-gray-600">Especialização em</span>
                        <input type="text" ref={newPosNameRef} placeholder="Ex: BIM Avançado" className="p-2 border rounded-r-md w-full flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Carga Horária Total (h)</label>
                      <input type="number" ref={newPosHoursRef} placeholder="Ex: 360" className="p-2 border rounded-md w-full mt-1" disabled={isSumByCycles} />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center space-x-2 text-sm text-gray-700">
                        <input type="checkbox" ref={sumByCyclesCheckboxRef} onChange={handleSumByCyclesChange} className="rounded" />
                        <span>Somar pelos ciclos</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button onClick={handlePosNextStep} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">
                      Avançar para Ciclos
                    </Button>
                    <Button onClick={resetPosForm} variant="outline" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {currentPosStep === 2 && (
                <div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">Selecione os Ciclos</h3>
                  <p className={`text-sm mb-4 ${validateSelection() ? 'text-green-700' : 'text-yellow-700'}`}>
                    Soma dos ciclos deve ser{' '}
                    <span className="font-bold">
                      {isSumByCycles ? 'pelo menos 360h' : `exatamente ${targetHours}h`}
                    </span>.
                  </p>
                  <div className="cycle-checkbox-list bg-white p-3 rounded-md border space-y-2">
                    {cyclesData.map((cycle, index) => (
                      <label key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                        <input
                          type="checkbox"
                          className="cycle-checkbox rounded"
                          value={cycle.name}
                          checked={selectedCycles.includes(cycle.name)}
                          onChange={handleCycleCheckboxChange}
                        />
                        <span>{cycle.name} ({cycle.hours}h)</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 font-semibold text-gray-800">
                    Total Selecionado: <span className="font-bold">{selectedHoursTotal}h</span>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button onClick={handleSavePos} disabled={!validateSelection()} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      Salvar Especialização
                    </Button>
                    <Button onClick={() => setCurrentPosStep(1)} variant="outline" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">
                      Voltar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isAdmin && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg mt-6">
            <h3 className="text-xl font-bold text-purple-800 mb-2">Crie sua Própria Trilha!</h3>
            <p className="text-purple-700">Converse com nossa coordenação para combinar os ciclos que mais interessam a você e montar a formação perfeita para impulsionar sua carreira.</p>
        </div>
      )}
    </div>
  );
}