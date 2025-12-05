
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { Calendar, Star, ExternalLink, MessageCircle, Mail } from 'lucide-react';

export default function InscricoesMatriculasPage() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Próximos Passos e Datas Cruciais
      </h2>

      <div className="space-y-5 mb-8">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl border-none overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Calendar className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1 opacity-90">Evento Exclusivo!</p>
                <p className="text-2xl font-bold mb-2">Workshop Integrativo (Grátis)</p>
                <p className="text-sm mb-3 text-justify">
                  Tecnologias aplicadas na Gestão de Obras, promovido pela coordenação.
                </p>
                <p className="text-lg font-extrabold bg-white/20 inline-block px-4 py-2 rounded-lg mb-4">
                  Dias: 16 e 17/10/25 (Online)
                </p>
                
                <div className="mt-4 bg-white/10 p-4 rounded-lg border border-white/20">
                  <p className="text-sm font-semibold mb-2">🔗 Para participar, basta entrar no link nos dias do evento:</p>
                  <a href="https://meet.google.com/zgs-tidt-uqw" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-white text-green-700 hover:bg-gray-100 font-bold py-3 mt-2">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Acessar Google Meet do Workshop
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-xl border-none">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Star className="w-10 h-10 flex-shrink-0 fill-current" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Atenção, Vagas!</p>
                <p className="text-2xl font-bold mb-2">Abertura de Matrículas</p>
                <p className="text-base font-medium mb-3 text-justify">
                  Divulgação do período de matrícula até dia <strong>10/10/2025</strong>. Não perca o prazo para 
                  garantir sua vaga e o valor promocional.
                </p>
                <p className="text-sm font-medium bg-white/30 p-3 rounded-lg mb-4 text-justify">
                  Para quem já se inscreveu e não efetuou o pagamento, lembre-se: a matrícula só é liberada após o pagamento da inscrição. 
                  Aproveite a oportunidade de começar seu upgrade profissional pagando menos!
                </p>

                <div className="space-y-3 mt-5">
                  <a href="https://bit.ly/inscpg" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 shadow-lg">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Inscreva-se Agora!
                    </Button>
                  </a>
                  <a href="https://bit.ly/centraldocandidatodapos" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 shadow-lg">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Acessar Central do Candidato (Pagamento e Matrícula)
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-2 border-blue-600">
          <CardContent className="p-6 text-center">
            <p className="font-bold text-blue-800 text-lg mb-2">Aula Inaugural Confirmada:</p> 
            <p className="text-3xl font-extrabold text-orange-600 mb-2">25 de Outubro de 2025</p>
            <p className="text-sm text-gray-600">
              O pontapé inicial da sua jornada de especialização.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center mb-8">
        <p className="text-sm text-gray-600 mb-4 text-justify">
          <strong>Aviso:</strong> Todas essas atualizações serão publicadas até o fim do dia 
          na página oficial do curso.
        </p>
        <a href="https://esuda.edu.br/posgraduacao/especializacao-em-gestao-de-projetos-e-obras-orcamento-e-pericia/" target="_blank" rel="noopener noreferrer">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 text-lg shadow-xl rounded-xl">
            <ExternalLink className="w-6 h-6 mr-3" />
            Acesse a Página Oficial do Curso ESUDA
          </Button>
        </a>
      </div>

      <Card className="shadow-xl border-none">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Dúvidas? Fale Comigo!
          </h3>
          <p className="text-base text-center mb-6 text-gray-700 text-justify">
            Se você tiver qualquer dúvida sobre o conteúdo, matrícula ou precisa de um 
            empurrãozinho, <strong>não hesite em me chamar no WhatsApp!</strong>
          </p>
          
          <div className="space-y-3">
            <a href="https://wa.me/5581991298803" target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 text-lg shadow-lg">
                <MessageCircle className="w-6 h-6 mr-3" />
                Chamar Emanoel no WhatsApp
              </Button>
            </a>

            <a href="mailto:possoajudarsecretariapos@esuda.edu.br" className="block">
              <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 text-lg">
                <Mail className="w-6 h-6 mr-3" />
                E-mail da Secretaria da Pós-Graduação
              </Button>
            </a>
          </div>
          
          <p className="text-xs text-red-500 italic mt-4 text-center">
            *As mensagens do grupo estão desativadas para manter a organização, mas me procurem diretamente!
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('EmAcaoPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('Homepage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Voltar ao Início
          </Button>
        </Link>
      </div>
    </div>
  );
}
