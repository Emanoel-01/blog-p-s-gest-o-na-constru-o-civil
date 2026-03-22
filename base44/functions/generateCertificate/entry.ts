import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await req.json();
    const { discente_id, especializacao_id } = payload;

    // Buscar dados do aluno e especialização
    const discente = (await base44.asServiceRole.entities.Discente.filter({ id: discente_id }))[0];
    const especializacao = (await base44.asServiceRole.entities.Especializacao.filter({ id: especializacao_id }))[0];

    if (!discente || !especializacao) {
      return Response.json({ error: 'Discente ou Especialização não encontrada' }, { status: 404 });
    }

    // Criar PDF do certificado
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background e bordas decorativas
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setDrawColor(61, 179, 118);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 267, 180);

    // Logo ESUDA (placeholder - usar URL real se disponível)
    // doc.addImage('LOGO_URL', 'PNG', 125, 25, 50, 20);

    // Título
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(61, 179, 118);
    doc.text('CERTIFICADO', 148.5, 60, { align: 'center' });

    // Subtítulo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Certificamos que', 148.5, 75, { align: 'center' });

    // Nome do aluno
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(discente.nome.toUpperCase(), 148.5, 90, { align: 'center' });

    // Texto de conclusão
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const textoConlusao = `concluiu com êxito a especialização em`;
    doc.text(textoConlusao, 148.5, 105, { align: 'center' });

    // Nome da especialização
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(61, 179, 118);
    const splitTitle = doc.splitTextToSize(especializacao.nome, 240);
    doc.text(splitTitle, 148.5, 118, { align: 'center' });

    // Carga horária
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Carga horária: ${especializacao.carga_horaria || 360}h`, 148.5, 135, { align: 'center' });

    // Data de emissão
    const dataEmissao = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    doc.text(`Recife, ${dataEmissao}`, 148.5, 150, { align: 'center' });

    // Assinaturas (placeholder)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.line(50, 175, 120, 175);
    doc.text('Coordenação Acadêmica', 85, 180, { align: 'center' });
    
    doc.line(177, 175, 247, 175);
    doc.text('Direção ESUDA', 212, 180, { align: 'center' });

    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('ESUDA - Escola Superior de Desenvolvimento e Aperfeiçoamento', 148.5, 195, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=certificado_${discente.nome.replace(/\s+/g, '_')}.pdf`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});