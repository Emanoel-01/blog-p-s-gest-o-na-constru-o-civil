import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function CRMDashboard({ inscritos }) {
  // Filtrar G1 e G2, excluindo "Matriculado Turma Antiga"
  const leadsAtivos = inscritos.filter(i => 
    (i.grupo_monitoramento === 'G1_Cursos_Atuais' || i.grupo_monitoramento === 'G2_Cursos_Legacy_Pos_Ago2024') && 
    i.status_crm !== 'Matriculado Turma Antiga'
  );
  
  const leadsG1 = inscritos.filter(i => 
    i.grupo_monitoramento === 'G1_Cursos_Atuais' && 
    i.status_crm !== 'Matriculado Turma Antiga'
  );
  
  const leadsG2 = inscritos.filter(i => 
    i.grupo_monitoramento === 'G2_Cursos_Legacy_Pos_Ago2024' && 
    i.status_crm !== 'Matriculado Turma Antiga'
  );

  const stats = {
    total: leadsAtivos.length,
    novos: leadsAtivos.filter(i => i.status_crm === 'Novo').length,
    contatados: leadsAtivos.filter(i => i.status_crm === 'Contatado').length,
    em_negociacao: leadsAtivos.filter(i => i.status_crm === 'Em Negociação').length,
    matriculados: leadsAtivos.filter(i => i.status_crm === 'Matriculado Turma Nova').length,
    pagos: leadsAtivos.filter(i => i.inscricao_paga).length,
    nao_pagos: leadsAtivos.filter(i => !i.inscricao_paga).length
  };

  const taxaConversao = stats.total > 0 ? ((stats.matriculados / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total de Leads Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                  <p className="text-xs text-blue-700 mt-2">
                    {leadsG1.length} leads G1 + {leadsG2.length} leads G2
                  </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Taxa de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{taxaConversao}%</div>
          <p className="text-xs text-green-700 mt-1">
            {stats.matriculados} matriculados turma nova de {stats.total} leads
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Necessitam Atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-900">{stats.novos + stats.em_negociacao}</div>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-yellow-600 text-white text-xs">Novos: {stats.novos}</Badge>
            <Badge className="bg-orange-600 text-white text-xs">Negociação: {stats.em_negociacao}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Status de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Pagos
              </span>
              <span className="font-bold text-purple-900">{stats.pagos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Pendentes
              </span>
              <span className="font-bold text-purple-900">{stats.nao_pagos}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}