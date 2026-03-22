import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { materialId } = await req.json();

        if (!materialId) {
            return Response.json({ error: 'materialId is required' }, { status: 400 });
        }

        const material = await base44.asServiceRole.entities.MaterialTurma.get(materialId);

        if (!material) {
            return Response.json({ error: 'Material not found' }, { status: 404 });
        }

        // Link Externo: retorna a URL diretamente
        if (material.tipo === 'Link Externo') {
            return Response.json({ stream_url: material.file_url, tipo: material.tipo });
        }

        // Arquivo privado (base44://) — gera URL assinada temporária
        const isPrivateFile = material.file_url?.startsWith('base44://');

        if (!isPrivateFile) {
            // Arquivo público legado — retorna diretamente
            return Response.json({ stream_url: material.file_url, tipo: material.tipo, permitir_download: material.permitir_download });
        }

        const isAdmin = user.role === 'admin';
        const canDownload = isAdmin || material.permitir_download;

        // Gera URL assinada com 1h de validade
        const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
            file_uri: material.file_url,
            expires_in: 3600
        });

        if (canDownload) {
            return Response.json({ signed_url, tipo: material.tipo });
        }

        // Sem permissão de download — retorna viewer_url para PDFs/Slides/Documentos
        if (['PDF', 'Slides', 'Documento'].includes(material.tipo)) {
            const viewer_url = `https://docs.google.com/gview?url=${encodeURIComponent(signed_url)}&embedded=true`;
            return Response.json({ viewer_url, tipo: material.tipo });
        }

        // Vídeo e Imagem sem download — stream_url (sem header de download)
        return Response.json({ stream_url: signed_url, tipo: material.tipo, permitir_download: false });

    } catch (error) {
        console.error('serveMaterial error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});