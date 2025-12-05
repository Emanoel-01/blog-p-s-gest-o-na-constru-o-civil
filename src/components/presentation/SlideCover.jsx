import React from 'react';

export default function SlideCover() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <img
        src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
        alt="Logo da Faculdade ESUDA"
        className="w-64 md:w-80 mx-auto mb-8"
      />
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
        Pós-Graduação em Arquitetura e Engenharia Civil
      </h1>
      <p className="text-xl md:text-2xl text-gray-600">
        Conheça as especializações: Inovação, Tecnologia e Foco no Mercado
      </p>
    </div>
  );
}