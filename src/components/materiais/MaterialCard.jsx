import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Video, Link as LinkIcon, Image, Download, ExternalLink, Trash2, Lock } from 'lucide-react';
import { serveMaterial } from '@/functions/serveMaterial';
import { base44 } from '@/api/base44Client';
import MaterialComentarios from './MaterialComentarios';

const tipoIcons = {
  Vídeo: Video,
  PDF: FileText,
  Slides: FileText,
  'Link Externo': LinkIcon,
  Imagem: Image,
  Documento: BookOpen,
};

const tipoColors = {
  Vídeo: 'bg-red-100 text-red-700',
  PDF: 'bg-orange-100 text-orange-700',
  Slides: 'bg-yellow-100 text-yellow-700',
  'Link Externo': 'bg-blue-100 text-blue-700',
  Imagem: 'bg-green-100 text-green-700',
  Documento: 'bg-gray-100 text-gray-700',
};

function MaterialPreview({ material, user, discente, isProfessor }) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['serveMaterial', material.id],
    queryFn: () => serveMaterial({ materialId: material.id }).then(r => r.data),
    staleTime: 50 * 60 * 1000,
  });

  // Registra visualização ao carregar o preview
  const registrarMutation = useMutation({
    mutationFn: () => base44.entities.MaterialVisualizacao.create({
      material_id: material.id,
      aluno_email: user?.email,
      aluno_nome: user?.full_name || discente?.nome || user?.email,
      turma: discente?.numero_turma || '',
      material_titulo: material.titulo,
      material_tipo: material.tipo
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visualizacoes-aluno'] })
  });

  // Registra uma única vez quando o preview carrega com sucesso
  useEffect(() => {
    if (data && user?.email) {
      const key = `vis_${material.id}_${user.email}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        registrarMutation.mutate();
      }
    }
  }, [data, user?.email]);

  if (isLoading) {
    return <div className="mt-3 h-8 flex items-center text-xs text-gray-400 animate-pulse">Carregando...</div>;
  }

  if (error || !data) {
    return <p className="mt-3 text-xs text-red-400">Erro ao carregar material.</p>;
  }

  const { signed_url, viewer_url, stream_url, tipo, permitir_download } = data;

  // Download liberado
  if (signed_url) {
    if (tipo === 'Vídeo') {
      return (
        <video
          controls
          src={signed_url}
          className="w-full rounded-lg mt-3"
          controlsList="nodownload"
          onContextMenu={e => e.preventDefault()}
        />
      );
    }
    if (tipo === 'Imagem') {
      return (
        <div className="mt-3">
          <img src={signed_url} alt={material.titulo} className="w-full rounded-lg max-h-48 object-cover" />
          <a href={signed_url} download target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 mt-2 text-green-600 hover:underline text-sm font-medium">
            <Download className="w-4 h-4" /> Baixar imagem
          </a>
        </div>
      );
    }
    return (
      <a href={signed_url} target="_blank" rel="noopener noreferrer"
        className={`flex items-center gap-2 mt-3 hover:underline text-sm font-medium ${tipoColors[tipo]?.replace('bg-', 'text-').replace('-100', '-700') || 'text-gray-700'}`}>
        <Download className="w-4 h-4" /> Baixar {tipo}
      </a>
    );
  }

  // Somente visualização — viewer embarcado (PDF/Slides/Documento)
  if (viewer_url) {
    return (
      <div className="mt-3">
        <iframe
          src={viewer_url}
          className="w-full h-72 rounded-lg border"
          title={material.titulo}
          sandbox="allow-scripts allow-same-origin"
        />
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Apenas visualização — download não permitido
        </p>
      </div>
    );
  }

  // Stream URL (vídeo ou imagem sem download, ou link externo)
  if (stream_url) {
    if (tipo === 'Link Externo') {
      return (
        <a href={stream_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 mt-3 text-blue-600 hover:underline text-sm font-medium">
          <ExternalLink className="w-4 h-4" /> Acessar material
        </a>
      );
    }
    if (tipo === 'Vídeo') {
      return (
        <div className="mt-3">
          <video
            controls
            src={stream_url}
            className="w-full rounded-lg"
            controlsList="nodownload"
            onContextMenu={e => e.preventDefault()}
          />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Apenas visualização — download não permitido
          </p>
        </div>
      );
    }
    if (tipo === 'Imagem') {
      return (
        <div className="mt-3 relative select-none">
          <img
            src={stream_url}
            alt={material.titulo}
            className="w-full rounded-lg max-h-48 object-cover pointer-events-none"
            onContextMenu={e => e.preventDefault()}
            draggable="false"
          />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Apenas visualização — download não permitido
          </p>
        </div>
      );
    }
  }

  return null;
}

export default function MaterialCard({ material, especializacoes, isAdmin, isProfessor, user, discente, onExcluir }) {
  const Icon = tipoIcons[material.tipo] || BookOpen;
  const espec = especializacoes?.find(e => e.id === material.especializacao_id);

  return (
    <Card className="border-2 border-gray-200 hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${tipoColors[material.tipo] || tipoColors.Documento}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className={`text-xs ${tipoColors[material.tipo] || tipoColors.Documento}`}>
                {material.tipo}
              </Badge>
              {material.tipo !== 'Link Externo' && (
                <Badge className={`text-xs flex items-center gap-1 ${material.permitir_download ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {material.permitir_download ? <Download className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {material.permitir_download ? 'Download liberado' : 'Só visualização'}
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm leading-snug">{material.titulo}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {material.descricao && (
          <p className="text-xs text-gray-600 line-clamp-2">{material.descricao}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {espec && <Badge variant="outline" className="text-xs">{espec.nome}</Badge>}
          {material.turma && <Badge variant="outline" className="text-xs">Turma {material.turma}</Badge>}
          {material.disciplina_nome && <Badge variant="outline" className="text-xs">{material.disciplina_nome}</Badge>}
        </div>
        <MaterialPreview material={material} user={user} discente={discente} isProfessor={isProfessor} />
        <MaterialComentarios
          materialId={material.id}
          user={user}
          discente={discente}
          isProfessor={isProfessor || isAdmin}
        />
        {isAdmin && (
          <button onClick={() => onExcluir(material.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 mt-1">
            <Trash2 className="w-3 h-3" /> Excluir
          </button>
        )}
      </CardContent>
    </Card>
  );
}