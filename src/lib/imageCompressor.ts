// Utility per comprimere immagini prima di salvarle in Firestore
// Mantiene le dimensioni del file sotto 100KB per evitare il limite Firestore di 1MB (1,048,576 bytes)

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.75)
  maxBytes?: number; // target max bytes, default 150 * 1024 (150KB)
}

/**
 * Ridimensiona e comprime un file immagine tramite Canvas HTML5
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.75,
    maxBytes = 150 * 1024
  } = options;

  return new Promise((resolve, reject) => {
    // Se non siamo in un ambiente browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calcola proporzioni mantenendo l'aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
          return;
        }

        // Migliore qualità di smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Prova JPEG a qualità definita
        let result = canvas.toDataURL('image/jpeg', quality);

        // Se è ancora sopra maxBytes (base64 string length ~ bytes * 1.33)
        if (result.length > maxBytes * 1.37 && quality > 0.4) {
          result = canvas.toDataURL('image/jpeg', Math.max(0.4, quality - 0.25));
        }

        resolve(result);
      } catch (err) {
        // Fallback su lettura diretta
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Comprime una stringa data URL (base64) esistente se supera la dimensione specificata
 */
export async function compressDataUrl(
  dataUrl: string,
  options: CompressImageOptions = {}
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  // Se è già sotto i 120KB, non serve ricomprimere
  if (dataUrl.length < 120 * 1024) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      try {
        const maxWidth = options.maxWidth || 1000;
        const maxHeight = options.maxHeight || 1000;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/jpeg', options.quality || 0.65);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
