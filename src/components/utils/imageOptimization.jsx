/**
 * Otimização de imagens no frontend antes do upload
 */

/**
 * Redimensiona e comprime uma imagem usando Canvas API
 */
export async function optimizeImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Criar canvas e redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            // Criar novo arquivo otimizado
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, `.${outputFormat.split('/')[1]}`),
              { type: outputFormat }
            );
            
            resolve(optimizedFile);
          },
          outputFormat,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Valida se o arquivo é uma imagem
 */
export function isImageFile(file) {
  return file.type.startsWith('image/');
}

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Opções predefinidas para diferentes tipos de upload
 */
export const optimizationPresets = {
  profile: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
    outputFormat: 'image/jpeg',
  },
  cover: {
    maxWidth: 1920,
    maxHeight: 600,
    quality: 0.85,
    outputFormat: 'image/jpeg',
  },
  testimonial: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    outputFormat: 'image/jpeg',
  },
  post: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9,
    outputFormat: 'image/jpeg',
  },
};