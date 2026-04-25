// Add a new entry here for each product you sell.
// blobUrl: paste the URL returned by Vercel Blob after uploading the file (access: public).
//   The URL contains a random Vercel token — it's unguessable and never exposed in frontend code.
// stripePriceId: copy from Stripe Dashboard → Products → [product] → Pricing.

const PRODUCTS = {
  solene: {
    name: 'Solene',
    stripePriceId: process.env.STRIPE_PRICE_SOLENE,
    blobUrl: 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/Sole%CC%80ne%20by%20alexg.zip',
    page: 'lut:cinematic-01',
  },
  flowstate: {
    name: 'Solene',
    stripePriceId: process.env.STRIPE_PRICE_SOLENE,
    blobUrl: 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/Sole%CC%80ne%20by%20alexg.zip',
    page: 'plugin:flowstate',
  },
};

module.exports = { PRODUCTS };
