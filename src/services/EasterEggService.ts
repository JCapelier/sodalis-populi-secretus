export enum EasterEggType {
  Text = 'text',
  Link = 'link',
  Button = 'button'
}

export type EasterEggResult =
  | { type: EasterEggType.Text; value: string }
  | { type: EasterEggType.Link; value: string }
  | { type: EasterEggType.Button; label: string; onClick: () => void }


export class EasterEggService {
  static getEasterEgg(username: string | undefined, drafted: string | null, priceLimitCents?: number | null): EasterEggResult | null {
    if (!username) return null;
    if (username === 'Esther' && drafted) {
      return {type: EasterEggType.Text, value: `Hyper bizarre, de tirer ${drafted}, pas vrai ?`};
    }
    if (username === 'Florette') {
      return {type: EasterEggType.Text, value: 'Votre compte a bien été débité de 1500€'};
    }
    if (username === 'claude' && priceLimitCents != null) {
      const limit = (priceLimitCents / 100).toFixed(2).replace(/\.00$/, '');
      return {type: EasterEggType.Text, value: `Juste pour rappel: la limite de prix est de ${limit}€. ... ${limit}€.  Je crois que tu as mal lu, c'est ${limit}€!`};
    }
    if (username === 'loris') {
      return {type: EasterEggType.Text, value: `Non, tu n'as pas le droit de le dire à Esther. Vraiment pas le droit, j'insiste... Esther, arrête de regarder par dessus-son épaule !`};
    }
    if (username === 'Anne-Laure') {
      return {type: EasterEggType.Text, value: `Si ça ne te va pas, on doit pouvoir s'arranger pour tricher. Tout pour mon Doudou!`};
    }
    if (username === 'Mara') {
      return {type: EasterEggType.Text, value: 'Manger du papier, ça allait encore, mais manger le téléphone ...'}
    }
    if (username === 'pierre') {
      return {type: EasterEggType.Text, value: 'Tu aurais dû prendre ton D6 avec toi!'}
    }
    if (username === 'RATAK') {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      return {type: EasterEggType.Link, value: url}
    }
    if (username === 'Garance') {
      return {type: EasterEggType.Text, value: 'C\'est pas l\'nom d\'une fleur!'}
    }
    if (username === 'Cosima') {
      return {type: EasterEggType.Text, value: 'Pour l\'amour et la justice!'}
    }
    if (username === 'Thalie') {
      return {type: EasterEggType.Text, value: '❤️💕🐰💕❤️'}
    }
    if (username === 'Zach') {
      return {type: EasterEggType.Text, value: 'Faut pas avoir honte de ton frère, un jour, il ressemblera à quelque chose, ce site... On y croit à mort!'}
    }
    return null;
  }

}
