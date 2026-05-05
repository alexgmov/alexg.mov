// Add a new entry here for each product you sell.
// blobUrl: paste the private URL returned by Vercel Blob after uploading the file.
//   Keep it server-side; it is never exposed in frontend code.
// stripePriceId: copy from Stripe Dashboard → Products → [product] → Pricing.
// statementDescriptorSuffix: card-statement label appended after your Stripe account prefix.

const PRODUCTS = {
  solene: {
    name: 'MERIDIAN',
    stripePriceId: process.env.STRIPE_PRICE_SOLENE,
    statementDescriptorSuffix: 'MERIDIAN',
    blobUrl: process.env.MERIDIAN_BLOB_URL || 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/MERIDIAN%20by%20alexg.zip',
    downloadFilename: 'MERIDIAN by alexg.zip',
    page: 'lut:cinematic-01',
  },
  onyx: {
    name: 'ONYX',
    stripePriceId: process.env.STRIPE_PRICE_ONYX,
    statementDescriptorSuffix: 'ONYX',
    blobUrl: process.env.ONYX_BLOB_URL || 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/ONYX%20by%20alexg.zip',
    downloadFilename: 'ONYX by alexg.zip',
    page: 'lut:onyx',
  },
  haloclyne: {
    name: 'HALOCLYNE',
    stripePriceId: process.env.STRIPE_PRICE_HALOCLYNE,
    statementDescriptorSuffix: 'HALOCLYNE',
    blobUrl: process.env.HALOCLYNE_BLOB_URL || 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/HALOCLYNE%20by%20alexg.zip',
    downloadFilename: 'HALOCLYNE by alexg.zip',
    page: 'lut:haloclyne',
  },
  flowstate: {
    name: 'MERIDIAN',
    stripePriceId: process.env.STRIPE_PRICE_SOLENE,
    statementDescriptorSuffix: 'MERIDIAN',
    blobUrl: process.env.MERIDIAN_BLOB_URL || 'https://kuownxqapvwc1svu.private.blob.vercel-storage.com/LUTS/MERIDIAN%20by%20alexg.zip',
    downloadFilename: 'MERIDIAN by alexg.zip',
    page: 'plugin:flowstate',
  },
};

module.exports = { PRODUCTS };
