import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Gera ou recupera um visitor_id único por navegador
function getVisitorId() {
  let visitorId = localStorage.getItem('esuda_visitor_id');
  if (!visitorId) {
    visitorId = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('esuda_visitor_id', visitorId);
  }
  return visitorId;
}

// Detecta a origem do acesso
function getReferrerLabel() {
  const ref = document.referrer;
  if (!ref) return 'Direto';
  if (ref.includes('google')) return 'Google';
  if (ref.includes('facebook') || ref.includes('fb.com')) return 'Facebook';
  if (ref.includes('whatsapp')) return 'WhatsApp';
  if (ref.includes('instagram')) return 'Instagram';
  if (ref.includes('linkedin')) return 'LinkedIn';
  if (ref.includes('t.co') || ref.includes('twitter')) return 'Twitter/X';
  return ref.split('/')[2] || 'Outro';
}

export function usePostTracking() {
  const trackView = useCallback(async (post, user) => {
    if (!post?.id) return;
    const visitorId = getVisitorId();
    
    // Evita re-registrar a mesma visita na mesma sessão
    const sessionKey = `viewed_${post.id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    base44.entities.PostView.create({
      post_id: post.id,
      post_titulo: post.titulo,
      visitor_id: visitorId,
      user_email: user?.email || '',
      user_nome: user?.full_name || '',
      is_logged_in: !!user?.email,
      tipo_acesso: 'post',
      referrer: getReferrerLabel(),
      user_agent: navigator.userAgent.slice(0, 200)
    });
  }, []);

  const trackMidiaClick = useCallback((post, midia, user) => {
    if (!post?.id || !midia?.url) return;
    const visitorId = getVisitorId();

    base44.entities.PostView.create({
      post_id: post.id,
      post_titulo: post.titulo,
      visitor_id: visitorId,
      user_email: user?.email || '',
      user_nome: user?.full_name || '',
      is_logged_in: !!user?.email,
      tipo_acesso: midia.tipo || 'link',
      midia_titulo: midia.titulo || '',
      midia_url: midia.url,
      referrer: getReferrerLabel(),
      user_agent: navigator.userAgent.slice(0, 200)
    });
  }, []);

  return { trackView, trackMidiaClick };
}