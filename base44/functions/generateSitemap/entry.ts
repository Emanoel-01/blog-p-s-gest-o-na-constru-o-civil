import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all public posts
    const posts = await base44.asServiceRole.entities.Post.list('-data');
    
    // Fetch all professors and students for profiles
    const professores = await base44.asServiceRole.entities.Professor.list();
    const discentes = await base44.asServiceRole.entities.Discente.list();
    
    const baseUrl = 'https://posgraduacao-esuda.base44.app';
    const now = new Date().toISOString();
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/Homepage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/EspecializacoesPage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/CiclosPage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/ProfessoresPage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/CorpoDiscentePage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/DepoimentosPage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/EmAcaoPage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/CalendarioDeAula</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/ParceirosPage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/IncubadoraProfissionalPage</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Blog Posts -->
${posts.map(post => `  <url>
    <loc>${baseUrl}/EmAcaoPage?postId=${post.id}</loc>
    <lastmod>${post.updated_date || post.created_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
  
  <!-- Professor Profiles -->
${professores.map(prof => `  <url>
    <loc>${baseUrl}/PerfilDocente?id=${prof.id}</loc>
    <lastmod>${prof.updated_date || prof.created_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
  
  <!-- Student Profiles -->
${discentes.map(aluno => `  <url>
    <loc>${baseUrl}/PerfilDiscente?id=${aluno.id}</loc>
    <lastmod>${aluno.updated_date || aluno.created_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});