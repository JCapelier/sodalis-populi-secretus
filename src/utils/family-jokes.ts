// src/utils/family-jokes.ts

export function getFamilyJoke(username: string | undefined, drafted: string | null, priceLimitCents?: number | null): string | null {
  if (!username) return null;
  if (username === 'Esther' && drafted) {
    return `Hyper bizarre, de tirer ${drafted}, pas vrai ?`;
  }
  if (username === 'Florette') {
    return 'Votre compte a bien été débité de 1500€';
  }
  if (username === 'claude' && priceLimitCents != null) {
    const limit = (priceLimitCents / 100).toFixed(2).replace(/\.00$/, '');
    return `Juste pour rappel: la limite de prix est de ${limit}€. ... ${limit}€.  Je crois que tu as mal lu, c'est ${limit}€!`;
  }
  if (username === 'loris') {
    return `Non, tu n'as pas le droit de le dire à Esther. Vraiment pas le droit, j'insiste... Esther, arrête de regarder par dessus-son épaule !`;
  }
  if (username === 'Anne-Laure') {
    return `Si ça ne te va pas, on doit pouvoir s'arranger pour tricher. Tout pour mon Doudou!`;
  }
  if (username === 'Mara') {
    return 'Manger du papier, ça allait encore, mais manger le téléphone ...'
  }
  if (username === 'pierre') {
    return 'Tu aurais dû prendre ton D6 avec toi!'
  }
  return null;
}
