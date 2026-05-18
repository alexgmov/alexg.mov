import React from 'react';

export function formatPrice(value, fallback = '') {
  if (value == null) return fallback;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;
  if (amount === 0) return 'Free';
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

export function compareAtPriceFor(product) {
  const price = Number(product?.price);
  const compareAtPrice = Number(product?.compareAtPrice);
  if (!Number.isFinite(price) || !Number.isFinite(compareAtPrice)) return null;
  return compareAtPrice > price ? compareAtPrice : null;
}

export function pricingVariantFor(product) {
  if (product?.pricingVariant) return product.pricingVariant;
  const compareAtPrice = compareAtPriceFor(product);
  const price = Number(product?.price);
  if (compareAtPrice && Number.isFinite(price)) return `launch-${compareAtPrice}-${price}`;
  if (price === 0) return 'free';
  return 'standard';
}

export function pricingTrackingAttrs(product) {
  const attrs = {
    'data-pricing-variant': pricingVariantFor(product),
  };
  if (product?.price != null) attrs['data-price'] = String(product.price);
  if (compareAtPriceFor(product)) attrs['data-compare-at-price'] = String(product.compareAtPrice);
  return attrs;
}

export function priceNoteText(product, fallback = '') {
  return product?.priceNote || fallback;
}

export function PriceDisplay({
  product,
  fallbackLabel = 'Soon',
  mode = 'inline',
  showLabel = true,
}) {
  const current = product?.price == null
    ? (product?.release || fallbackLabel)
    : formatPrice(product.price, fallbackLabel);
  const compareAtPrice = compareAtPriceFor(product);
  const label = showLabel ? product?.priceLabel : '';

  return (
    <span className={`price-display price-display-${mode}`} {...pricingTrackingAttrs(product)}>
      {compareAtPrice ? (
        <span className="price-compare" aria-label={`Regular price ${formatPrice(compareAtPrice)}`}>
          {formatPrice(compareAtPrice)}
        </span>
      ) : null}
      <span className="price-current">{current}</span>
      {label ? <span className="price-label">{label}</span> : null}
    </span>
  );
}
