import Jimp from 'jimp';

/**
 * Efeitos de imagem usados pelos comandos de /fun (blur, pixelize, greyscale, invert, sepia, etc).
 * Usa "jimp" (100% JS, sem dependências nativas) para funcionar em qualquer ambiente sem compilação.
 */
async function loadImage(url: string): Promise<Jimp> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não consegui baixar a imagem para processar.');
  const buffer = Buffer.from(await response.arrayBuffer());
  return Jimp.read(buffer);
}

export const imageEffectsService = {
  async blur(url: string): Promise<Buffer> {
    const image = await loadImage(url);
    image.blur(8);
    return image.getBufferAsync(Jimp.MIME_PNG);
  },

  async pixelize(url: string): Promise<Buffer> {
    const image = await loadImage(url);
    image.pixelate(12);
    return image.getBufferAsync(Jimp.MIME_PNG);
  },

  async greyscale(url: string): Promise<Buffer> {
    const image = await loadImage(url);
    image.greyscale();
    return image.getBufferAsync(Jimp.MIME_PNG);
  },

  async invert(url: string): Promise<Buffer> {
    const image = await loadImage(url);
    image.invert();
    return image.getBufferAsync(Jimp.MIME_PNG);
  },

  async sepia(url: string): Promise<Buffer> {
    const image = await loadImage(url);
    image.sepia();
    return image.getBufferAsync(Jimp.MIME_PNG);
  },

  async rainbow(url: string): Promise<Buffer> {
    const image = await loadImage(url);
    image.color([{ apply: 'hue', params: [90] }, { apply: 'saturate', params: [40] }]);
    return image.getBufferAsync(Jimp.MIME_PNG);
  },

  async swirl(url: string): Promise<Buffer> {
    const image = await loadImage(url);
    const { width, height } = image.bitmap;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    const strength = 3;

    const original = image.clone();

    image.scan(0, 0, width, height, (x, y, idx) => {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > radius) return;

      const angle = strength * (1 - distance / radius);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const srcX = Math.round(centerX + dx * cosA - dy * sinA);
      const srcY = Math.round(centerY + dx * sinA + dy * cosA);

      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const srcIdx = original.getPixelIndex(srcX, srcY);
        image.bitmap.data[idx] = original.bitmap.data[srcIdx];
        image.bitmap.data[idx + 1] = original.bitmap.data[srcIdx + 1];
        image.bitmap.data[idx + 2] = original.bitmap.data[srcIdx + 2];
        image.bitmap.data[idx + 3] = original.bitmap.data[srcIdx + 3];
      }
    });

    return image.getBufferAsync(Jimp.MIME_PNG);
  },

  async ascii(url: string): Promise<string> {
    const image = await loadImage(url);
    const ramp = '@%#*+=-:. ';
    const cols = 48;
    const aspectCorrection = 0.5;
    const rows = Math.round((image.bitmap.height / image.bitmap.width) * cols * aspectCorrection);

    image.resize(cols, rows);
    image.greyscale();

    let result = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = image.getPixelIndex(x, y);
        const brightness = image.bitmap.data[idx];
        const char = ramp[Math.floor((brightness / 255) * (ramp.length - 1))];
        result += char;
      }
      result += '\n';
    }

    return '```\n' + result + '```';
  },
};
