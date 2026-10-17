import { logger } from '../utils/logger.js';

/**
 * Camada única de acesso a APIs públicas de imagens (todas sem chave/gratuitas).
 * Nunca finge sucesso: se a API falhar, propaga erro para o comando tratar.
 */
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API retornou status ${response.status}`);
  }
  return (await response.json()) as T;
}

export const imageApiService = {
  async randomCat(): Promise<string> {
    try {
      const data = await fetchJson<{ url: string }[]>('https://api.thecatapi.com/v1/images/search');
      return data[0].url;
    } catch (err) {
      logger.error('imageApiService', `Falha ao buscar gato: ${err}`);
      throw new Error('Não consegui buscar uma imagem de gato agora.');
    }
  },

  async randomDog(): Promise<string> {
    try {
      const data = await fetchJson<{ message: string }>('https://dog.ceo/api/breeds/image/random');
      return data.message;
    } catch (err) {
      logger.error('imageApiService', `Falha ao buscar cachorro: ${err}`);
      throw new Error('Não consegui buscar uma imagem de cachorro agora.');
    }
  },

  async randomFox(): Promise<string> {
    try {
      const data = await fetchJson<{ image: string }>('https://randomfox.ca/floof/');
      return data.image;
    } catch (err) {
      logger.error('imageApiService', `Falha ao buscar raposa: ${err}`);
      throw new Error('Não consegui buscar uma imagem de raposa agora.');
    }
  },

  async randomPanda(): Promise<string> {
    try {
      const data = await fetchJson<{ image: string }[]>('https://some-random-api.com/animal/panda');
      return data[0]?.image ?? '';
    } catch (err) {
      logger.error('imageApiService', `Falha ao buscar panda: ${err}`);
      throw new Error('Não consegui buscar uma imagem de panda agora. A API pode estar temporariamente indisponível.');
    }
  },

  async randomAnime(): Promise<string> {
    try {
      const data = await fetchJson<{ images: { jpg: { image_url: string } }[] }>(
        'https://api.jikan.moe/v4/random/anime'
      );
      return data.images?.jpg?.image_url ?? '';
    } catch (err) {
      logger.error('imageApiService', `Falha ao buscar anime: ${err}`);
      throw new Error('Não consegui buscar uma imagem de anime agora.');
    }
  },
  async randomManga(): Promise<{ title: string; url: string; image: string }> {
    try {
      const data = await fetchJson<{ data: { title: string; url: string; images: { jpg: { image_url: string } } } }>(
        'https://api.jikan.moe/v4/random/manga'
      );
      return { title: data.data.title, url: data.data.url, image: data.data.images.jpg.image_url };
    } catch (err) {
      logger.error('imageApiService', `Falha ao buscar mangá: ${err}`);
      throw new Error('Não consegui buscar um mangá agora.');
    }
  },

  async randomMeme(): Promise<{ title: string; url: string; subreddit: string }> {
    try {
      const data = await fetchJson<{ title: string; url: string; subreddit: string }>('https://meme-api.com/gimme');
      return data;
    } catch (err) {
      logger.error('imageApiService', `Falha ao buscar meme: ${err}`);
      throw new Error('Não consegui buscar um meme agora.');
    }
  },

  randomNature(): string {
    // source.unsplash.com redireciona pra uma imagem aleatória real da categoria; não requer chave de API.
    return `https://source.unsplash.com/random/1600x900/?nature,landscape&t=${Date.now()}`;
  },

  randomWallpaper(): string {
    return `https://source.unsplash.com/random/1920x1080/?wallpaper,minimal&t=${Date.now()}`;
  },
};
