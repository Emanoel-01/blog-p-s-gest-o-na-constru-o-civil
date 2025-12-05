import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[70vh]">
      <img
        src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
        alt="Logo da Faculdade ESUDA"
        className="w-64 md:w-80 mx-auto mb-8"
      />
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
        Pós-Graduação em Arquitetura e Engenharia Civil
      </h1>
      <p className="text-xl md:text-2xl text-gray-600 mb-8 text-justify">
        Conheça as especializações: Inovação, Tecnologia e Foco no Mercado
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <Link to={createPageUrl('UpgradePage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 text-lg">
            Conheça o Upgrade
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <Link to={createPageUrl('CiclosPage')}>
          <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-8 text-lg">
            Ver Ciclos de Conhecimento
          </Button>
        </Link>
      </div>
    </div>
  );
}