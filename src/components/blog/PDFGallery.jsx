import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PDFGallery({ pdfs }) {
  const [expandedPdf, setExpandedPdf] = useState(null);

  if (!pdfs || pdfs.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pdfs.map((pdf, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-gray-800 mb-2 truncate">
                    {pdf.titulo || `Documento ${idx + 1}`}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => setExpandedPdf(pdf)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Maximize2 className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Abrir
                      </Button>
                    </a>
                    <a href={pdf.url} download>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Baixar
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expandedPdf && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setExpandedPdf(null)}>
          <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800 truncate flex-1">
                {expandedPdf.titulo || 'Documento'}
              </h3>
              <div className="flex gap-2">
                <a href={expandedPdf.url} download>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                </a>
                <Button size="sm" onClick={() => setExpandedPdf(null)}>
                  Fechar
                </Button>
              </div>
            </div>
            <iframe
              src={expandedPdf.url}
              className="w-full flex-1"
              title={expandedPdf.titulo || 'PDF'}
            />
          </div>
        </div>
      )}
    </>
  );
}