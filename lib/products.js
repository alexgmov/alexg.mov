// Add a new entry here for each product you sell.
// blobUrl: paste the URL returned by Vercel Blob after uploading the file (access: public).
//   The URL contains a random Vercel token — it's unguessable and never exposed in frontend code.
// stripePriceId: copy from Stripe Dashboard → Products → [product] → Pricing.
// statementDescriptorSuffix: card-statement label appended after your Stripe account prefix.

const PRODUCTS = {
  solene: {
    name: 'Meridian',
    stripePriceId: process.env.STRIPE_PRICE_SOLENE,
    statementDescriptorSuffix: 'MERIDIAN',
    blobUrl: 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/MERIDIAN%20by%20alexg.zip',
    downloadFilename: 'MERIDIAN by alexg.zip',
    page: 'lut:cinematic-01',
  },
  flowstate: {
    name: 'Meridian',
    stripePriceId: process.env.STRIPE_PRICE_SOLENE,
    statementDescriptorSuffix: 'MERIDIAN',
    blobUrl: 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/MERIDIAN%20by%20alexg.zip',
    downloadFilename: 'MERIDIAN by alexg.zip',
    page: 'plugin:flowstate',
  },
};

module.exports = { PRODUCTS };
