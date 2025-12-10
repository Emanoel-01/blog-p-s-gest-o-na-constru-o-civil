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

      <div className="mt-8 pt-8 border-t-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Acesse Nossas Tecnologias Exclusivas
        </h3>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href="URL_GPO_4.0_AQUI" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 text-lg w-full md:w-auto">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm2 4.5a1 1 0 112 0 1 1 0 01-2 0z"/>
              </svg>
              GPO 4.0
            </Button>
          </a>
          <a href="URL_PREDIAL_4.0_AQUI" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 text-lg w-full md:w-auto">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Predial 4.0
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}