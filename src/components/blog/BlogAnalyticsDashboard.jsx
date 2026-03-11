import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, FileText, Video, Image, BarChart2, Globe, LogIn } from 'lucide-react';

export default function BlogAnalyticsDashboard() {
  const [periodo, setPeriodo] = useState(30); // dias

  const { data: views = [], isLoading } = useQuery({
    queryKey: ['post-views-analytics', periodo],
    queryFn: () => base44.entities.PostView.list('-created_date', 500)
  });

  if (isLoading) return (
    <div className="text-center py-8 text-gray-500">Carregando analytics...</div>
  );

  // Filtrar por período
  const desde = new Date();
  desde.setDate(desde.getDate() - periodo);
  const viewsFiltradas = views.filter(v => new Date(v.created_date) >= desde);

  // Métricas gerais
  const totalViews = viewsFiltradas.length;
  const visitantesUnicos = new Set(viewsFiltradas.map(v => v.visitor_id)).size;
  const logados = viewsFiltradas.filter(v => v.is_logged_in).length;
  const anonimos = totalViews - logados;

  // Views por tipo
  const porTipo = viewsFiltradas.reduce((acc, v) => {
    acc[v.tipo_acesso] = (acc[v.tipo_acesso] || 0) + 1;
    return acc;
  }, {});

  // Posts mais vistos
  const porPost = viewsFiltradas
    .filter(v => v.tipo_acesso === 'post')
    .reduce((acc, v) => {
      const titulo = v.post_titulo || v.post_id;
      acc[titulo] = (acc[titulo] || 0) + 1;
      return acc;
    }, {});
  const topPosts = Object.entries(porPost)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([titulo, count]) => ({ titulo: titulo.slice(0, 35) + (titulo.length > 35 ? '...' : ''), count }));

  // Mídias mais acessadas
  const midias = viewsFiltradas.filter(v => v.tipo_acesso !== 'post');
  const porMidia = midias.reduce((acc, v) => {
    const key = v.midia_titulo || v.midia_url || 'Sem título';
    if (!acc[key]) acc[key] = { titulo: key, tipo: v.tipo_acesso, count: 0 };
    acc[key].count++;
    return acc;
  }, {});
  const topMidias = Object.values(porMidia).sort((a, b) => b.count - a.count).slice(0, 6);

  // Origens (referrer)
  const porReferrer = viewsFiltradas.reduce((acc, v) => {
    const ref = v.referrer || 'Direto';
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});
  const topReferrers = Object.entries(porReferrer)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const tipoIcone = (tipo) => {
    if (tipo === 'video') return <Video className="w-3 h-3" />;
    if (tipo === 'pdf') return <FileText className="w-3 h-3" />;
    if (tipo === 'imagem') return <Image className="w-3 h-3" />;
    return <Globe className="w-3 h-3" />;
  };

  const tipoColor = (tipo) => {
    if (tipo === 'video') return 'bg-red-100 text-red-800';
    if (tipo === 'pdf') return 'bg-orange-100 text-orange-800';
    if (tipo === 'imagem') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filtro de período */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-gray-700">Período:</span>
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setPeriodo(d)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              periodo === d ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d} dias
          </button>
        ))}
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Acessos', value: totalViews, icon: Eye, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Visitantes Únicos', value: visitantesUnicos, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Usuários Logados', value: logados, icon: LogIn, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Visitantes Anônimos', value: anonimos, icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className={`p-4 ${bg} rounded-xl`}>
              <Icon className={`w-6 h-6 ${color} mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-600 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tipos de acesso */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.entries(porTipo).map(([tipo, count]) => (
          <div key={tipo} className="text-center bg-white border rounded-lg p-3">
            <p className="text-lg font-bold text-gray-800">{count}</p>
            <p className="text-xs text-gray-500 capitalize">{tipo}</p>
          </div>
        ))}
      </div>

      {/* Posts mais vistos */}
      {topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-pink-600" />
              Posts Mais Vistos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topPosts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="titulo" width={150} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#db2777" radius={[0, 4, 4, 0]} name="Visualizações" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mídias mais acessadas */}
        {topMidias.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                Mídias Mais Acessadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topMidias.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge className={`${tipoColor(m.tipo)} flex items-center gap-1 shrink-0`}>
                      {tipoIcone(m.tipo)} {m.tipo}
                    </Badge>
                    <span className="text-sm text-gray-700 truncate">{m.titulo}</span>
                  </div>
                  <span className="font-bold text-pink-600 text-sm shrink-0">{m.count}x</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Origens do tráfego */}
        {topReferrers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Origem dos Acessos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topReferrers.map(([referrer, count]) => (
                <div key={referrer} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-gray-700">{referrer}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-pink-400 rounded-full"
                      style={{ width: `${Math.max(20, (count / totalViews) * 100)}px` }}
                    />
                    <span className="font-bold text-gray-700 text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {totalViews === 0 && (
        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl">
          <Eye className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum acesso registrado nos últimos {periodo} dias.</p>
          <p className="text-xs mt-1">Os dados aparecem assim que visitantes acessam os posts.</p>
        </div>
      )}
    </div>
  );
}