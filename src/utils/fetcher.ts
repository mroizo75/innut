// src/utils/fetcher.ts
export const fetcher = (url: string) =>
    fetch(url).then(res => {
      if (!res.ok) {
        throw new Error('Feil ved henting av data');
      }
      return res.json();
    });