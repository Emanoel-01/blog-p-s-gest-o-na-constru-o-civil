import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] px-4">
      <img
        src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
        alt="Logo da Faculdade ESUDA"
        className="w-48 sm:w-64 md:w-80 mx-auto mb-6 md:mb-8"
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight px-2">
        Pós-Graduação em Arquitetura e Engenharia Civil
      </h1>
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 md:mb-8 max-w-3xl leading-relaxed px-4">
        Conheça as especializações: <span className="font-semibold text-green-700">Inovação, Tecnologia e Foco no Mercado</span>
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 w-full max-w-2xl mx-auto px-4">
        <Link to={createPageUrl('UpgradePage')} className="w-full sm:w-auto flex-1">
          <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
            Conheça o Upgrade
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </Link>
        <Link to={createPageUrl('CiclosPage')} className="w-full sm:w-auto flex-1">
          <Button variant="outline" className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
            Ver Ciclos de Conhecimento
          </Button>
        </Link>
      </div>

      <div className="mt-8 pt-6 md:pt-8 border-t-2 border-gray-200 w-full max-w-4xl mx-auto px-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
          Acesse Nossas Tecnologias Exclusivas
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
          <a href="URL_GPO_4.0_AQUI" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm2 4.5a1 1 0 112 0 1 1 0 01-2 0z"/>
              </svg>
              GPO 4.0
            </Button>
          </a>
          <a href="URL_PREDIAL_4.0_AQUI" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
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