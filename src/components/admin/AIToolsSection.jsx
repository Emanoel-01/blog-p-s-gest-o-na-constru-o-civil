import React from 'react';
import AIReportGenerator from './AIReportGenerator';
import AIContentCreator from './AIContentCreator';
import ProcessadorMatriculasPDF from './ProcessadorMatriculasPDF';

export default function AIToolsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Ferramentas de IA</h2>
      <AIReportGenerator />
      <AIContentCreator />
      <ProcessadorMatriculasPDF />
    </div>
  );
}