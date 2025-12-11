import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

export default function AtividadeList({ atividades, tipo, onEdit, onDelete }) {
  const renderAtividadeContent = (atividade) => {
    switch(tipo) {
      case 'Evento':
        return (
          <>
            <h4 className="font-bold text-gray-800 mb-1">{atividade.nome_evento}</h4>
            <p className="text-xs text-gray-500 mb-2">Data: {atividade.data}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{atividade.resumo}</p>
            {atividade.valor && (
              <p className="text-sm font-semibold text-blue-600 mt-2">R$ {atividade.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </>
        );
      case 'ArtigoCientifico':
        return (
          <>
            <h4 className="font-bold text-gray-800 mb-1">{atividade.titulo_artigo}</h4>
            <p className="text-xs text-gray-500 mb-2">Publicado em: {atividade.data_publicacao}</p>
            <p className="text-sm text-gray-600">{atividade.autores}</p>
            {atividade.valor && (
              <p className="text-sm font-semibold text-purple-600 mt-2">R$ {atividade.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </>
        );
      case 'CanteiroDidatico':
        return (
          <>
            <h4 className="font-bold text-gray-800 mb-1">{atividade.nome_canteiro}</h4>
            <p className="text-xs text-gray-500 mb-2">Data: {atividade.data}</p>
            <p className="text-sm text-gray-600">{atividade.local}</p>
            {atividade.valor && (
              <p className="text-sm font-semibold text-green-600 mt-2">R$ {atividade.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </>
        );
      case 'FreelancerNetwork':
        return (
          <>
            <h4 className="font-bold text-gray-800 mb-1">{atividade.nome_atividade}</h4>
            {atividade.tipo && (
              <Badge className={`mb-2 ${
                atividade.tipo === 'Empregado' ? 'bg-green-100 text-green-800' :
                atividade.tipo === 'Contratado' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {atividade.tipo}
              </Badge>
            )}
            <p className="text-xs text-gray-500 mb-2">Data: {atividade.data}</p>
            <p className="text-sm text-gray-600">{atividade.empresa_parceira}</p>
            {atividade.valor && (
              <p className="text-sm font-semibold text-orange-600 mt-2">R$ {atividade.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </>
        );
      case 'RelatorioTecnico':
        return (
          <>
            <h4 className="font-bold text-gray-800 mb-1">{atividade.titulo_relatorio}</h4>
            <p className="text-xs text-gray-500 mb-2">Data: {atividade.data}</p>
            <p className="text-sm text-gray-600">{atividade.autor}</p>
            {atividade.valor && (
              <p className="text-sm font-semibold text-cyan-600 mt-2">R$ {atividade.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </>
        );
      case 'ProducaoTecnologica':
        return (
          <>
            <h4 className="font-bold text-gray-800 mb-1">{atividade.titulo_producao}</h4>
            {atividade.tipo && (
              <Badge className="mb-2 bg-pink-100 text-pink-800">{atividade.tipo}</Badge>
            )}
            <p className="text-xs text-gray-500 mb-2">Data: {atividade.data}</p>
            {atividade.valor && (
              <p className="text-sm font-semibold text-pink-600 mt-2">R$ {atividade.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  if (!atividades || atividades.length === 0) {
    return (
      <p className="text-gray-500 italic text-center py-8">Nenhuma atividade cadastrada ainda.</p>
    );
  }

  return (
    <div className="grid gap-4">
      {atividades.map((atividade) => (
        <Card key={atividade.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {renderAtividadeContent(atividade)}
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(atividade)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(atividade.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}