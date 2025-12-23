import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Image as ImageIcon, Video, Filter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GaleriaMidiasAplicativos() {
  const [filtroApp, setFiltroApp] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  const { data: midias = [], isLoading } = useQuery({
    queryKey: ['aplicativo-midias'],
    queryFn: () => base44.entities.AplicativoMidia.list('ordem')
  });

  const aplicativosNomes = [
    'Todos', 'GPO 4.0', 'Predial 4.0', 'EngenhariaPro AI', 'InteriorOS',
    'Vistoria Cautelar Pro', 'SmartVisto', 'Amorim Responde',
    'LaudoAcess Pro', 'Avalia Predial ESUDA', 'Geral'
  ];

  const categorias = ['Todas', 'Tutorial', 'Demonstração', 'Interface', 'Resultado', 'Caso de Uso', 'Outro'];

  const midiasFiltradas = midias.filter(midia => {
    const appMatch = filtroApp === 'Todos' || midia.aplicativo_nome === filtroApp;
    const catMatch = filtroCategoria === 'Todas' || midia.categoria === filtroCategoria;
    const tipoMatch = filtroTipo === 'Todos' || midia.tipo_midia === filtroTipo;
    return appMatch && catMatch && tipoMatch;
  });

  return (
    <>
      <Helmet>
        <title>Galeria de Mídias | Aplicativos Inteligentes ESUDA</title>
        <meta name="description" content="Galeria de imagens e vídeos dos aplicativos inteligentes desenvolvidos pela ESUDA. Veja tutoriais, demonstrações e casos de uso." />
      </Helmet>

      <div className="space-y-8 pb-12">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Galeria de Mídias
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore vídeos, tutoriais e demonstrações dos nossos aplicativos inteligentes
          </p>
        </div>

        {/* Filtros */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Aplicativo
                </label>
                <Select value={filtroApp} onValueChange={setFiltroApp}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aplicativosNomes.map(nome => (
                      <SelectItem key={nome} value={nome}>{nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Categoria</label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Tipo</label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="imagem">Imagens</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(filtroApp !== 'Todos' || filtroCategoria !== 'Todas' || filtroTipo !== 'Todos') && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {midiasFiltradas.length} mídia(s) encontrada(s)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroApp('Todos');
                    setFiltroCategoria('Todas');
                    setFiltroTipo('Todos');
                  }}
                  className="text-xs"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grid de Mídias */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando mídias...</p>
          </div>
        ) : midiasFiltradas.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 italic">
                Nenhuma mídia encontrada com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {midiasFiltradas.map((midia, index) => (
                <motion.div
                  key={midia.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-gray-200">
                    <CardContent className="p-4">
                      {/* Mídia */}
                      <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                        {midia.tipo_midia === 'imagem' ? (
                          <img
                            src={midia.url_midia}
                            alt={midia.titulo}
                            loading="lazy"
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <video
                            src={midia.url_midia}
                            controls
                            preload="metadata"
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          {midia.tipo_midia === 'imagem' ? (
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Video className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{midia.titulo}</h3>
                      {midia.descricao && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{midia.descricao}</p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {midia.aplicativo_nome}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          {midia.categoria}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {midia.tags && midia.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {midia.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-8">
          <Link to={createPageUrl('AplicativosInteligentesPage')}>
            <Button variant="outline" className="border-gray-300">
              ← Voltar para Aplicativos
            </Button>
          </Link>
          <Link to={createPageUrl('Homepage')}>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              Ir para Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}