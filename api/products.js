// Add a new entry here for each product you sell.
// blobUrl: paste the URL returned by Vercel Blob after uploading the file (access: public).
//   The URL contains a random Vercel token — it's unguessable and never exposed in frontend code.
// stripePriceId: copy from Stripe Dashboard → Products → [product] → Pricing.

const PRODUCTS = {
  flowstate: {
    name: 'FlowState',
    stripePriceId: process.env.STRIPE_PRICE_FLOWSTATE,
    blobUrl: process.env.BLOB_URL_FLOWSTATE,
  },
};

module.exports = { PRODUCTS };
