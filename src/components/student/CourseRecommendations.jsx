import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Sparkles, TrendingUp, Target, Clock, CheckCircle, Loader2, Award } from 'lucide-react';

export default function CourseRecommendations({ discenteId }) {
  const [recommendations, setRecommendations] = useState(null);

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const getRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('recommendCourses', {
        discente_id: discenteId
      });
      return response.data;
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      toast.success('Recomendações personalizadas geradas!');
    },
    onError: (error) => {
      toast.error('Erro ao gerar recomendações: ' + error.message);
    }
  });

  const getEspecializacaoById = (id) => {
    return especializacoes.find(e => e.id === id);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Recomendações Personalizadas com IA
        </CardTitle>
        <CardDescription>
          Descubra as especializações ideais para o seu perfil e objetivos de carreira
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recommendations ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <Target className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Encontre Seu Próximo Passo
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Nossa IA analisará seu perfil profissional, competências atuais e objetivos 
                para recomendar as especializações mais adequadas para você.
              </p>
            </div>
            <Button
              onClick={() => getRecommendationsMutation.mutate()}
              disabled={getRecommendationsMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {getRecommendationsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando seu perfil...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Recomendações Personalizadas
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Career Path Suggestion */}
            <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
              <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sua Trajetória de Carreira Sugerida
              </h4>
              <p className="text-sm text-gray-700">{recommendations.career_path_suggestion}</p>
            </div>

            {/* Skills to Develop */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Competências Prioritárias
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.skills_to_develop?.map((skill, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900">
                Especializações Recomendadas para Você:
              </h4>
              {recommendations.recommendations?.map((rec, index) => {
                const espec = getEspecializacaoById(rec.especializacao_id);
                if (!espec) return null;

                return (
                  <Card key={rec.especializacao_id} className="border-2 border-gray-200 hover:border-purple-300 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getMatchColor(rec.match_score)}`}>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{rec.match_score}</div>
                              <div className="text-xs">Match</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h5 className="font-bold text-lg text-gray-900 mb-1">
                                {espec.nome}
                              </h5>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {espec.carga_horaria}h
                                </Badge>
                                <Badge className="text-xs bg-purple-600">
                                  #{index + 1} Recomendada
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <Progress value={rec.match_score} className="h-2" />
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h6 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Por que é ideal para você:
                              </h6>
                              <ul className="space-y-1">
                                {rec.razoes?.map((razao, i) => (
                                  <li key={i} className="text-sm text-gray-600 pl-5 list-disc">
                                    {razao}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h6 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                <Target className="w-4 h-4 text-blue-600" />
                                Benefícios Esperados:
                              </h6>
                              <ul className="space-y-1">
                                {rec.beneficios_esperados?.map((beneficio, i) => (
                                  <li key={i} className="text-sm text-gray-600 pl-5 list-disc">
                                    {beneficio}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-semibold text-gray-700">
                                Momento ideal:
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {rec.tempo_ideal_inicio}
                              </Badge>
                            </div>

                            <Link to={`${createPageUrl('EspecializacoesPage')}?id=${espec.id}`}>
                              <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                                Ver Detalhes da Especialização
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              onClick={() => getRecommendationsMutation.mutate()}
              variant="outline"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Atualizar Recomendações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}