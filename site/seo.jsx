import React from 'react';

// SEO + GEO helpers. Everything here mirrors visible page content.

const SITE_ORIGIN = 'https://alexg.mov';
const SITE_NAME = 'alexg.mov';
const SITE_IMAGE = `${SITE_ORIGIN}/mockups/meridian%20mockup.png`;

function routeHref(page = 'home', target = null) {
  const path = location.pathname && location.pathname !== '/' ? location.pathname : '/';
  const params = new URLSearchParams();
  if (page && page !== 'home') params.set('page', page);
  const query = params.toString();
  return `${path}${query ? `?${query}` : ''}${target ? `#${target}` : ''}`;
}

function absoluteRoute(page = 'home') {
  return `${SITE_ORIGIN}/${page && page !== 'home' ? `?page=${encodeURIComponent(page)}` : ''}`;
}

function upsertMeta(selector, createAttrs, content) {
  if (!content) return;
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => node.setAttribute(key, value));
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', rel);
    document.head.appendChild(node);
  }
  node.setAttribute('href', href);
}

function imageUrl(src) {
  if (!src) return SITE_IMAGE;
  try {
    return new URL(src, `${SITE_ORIGIN}/`).href;
  } catch {
    return SITE_IMAGE;
  }
}

function productOffer(price, url, available = true) {
  if (price == null) return undefined;
  return {
    '@type': 'Offer',
    price: String(price),
    priceCurrency: 'USD',
    availability: available ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
    url,
  };
}

function pluginProductSchema(plugin, page = `plugin:${plugin.id}`) {
  const url = absoluteRoute(page);
  return {
    '@type': ['Product', 'SoftwareApplication'],
    '@id': `${url}#product`,
    name: `${plugin.name} Premiere Pro plugin`,
    description: plugin.oneline,
    brand: { '@id': `${SITE_ORIGIN}/#organization` },
    category: 'Adobe Premiere Pro plugin',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'macOS 13+, Windows 10/11',
    softwareVersion: plugin.version,
    offers: productOffer(plugin.price, url, plugin.status === 'released'),
    url,
  };
}

function lutProductSchema(lut, page = `lut:${lut.id}`) {
  const url = absoluteRoute(page);
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: `${lut.name} cinematic LUT`,
    description: lut.oneline,
    image: imageUrl(lut.mockupSrc),
    brand: { '@id': `${SITE_ORIGIN}/#organization` },
    category: 'Digital color grading LUT',
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'File format', value: lut.formats || '.CUBE' },
      { '@type': 'PropertyValue', name: 'Compatible software', value: 'Adobe Premiere Pro, DaVinci Resolve, Final Cut Pro' },
    ],
    offers: productOffer(lut.price, url, lut.available),
    url,
  };
}

function faqSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

function baseGraph() {
  return [
    {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: SITE_NAME,
      url: SITE_ORIGIN,
      email: 'alex@alexg.mov',
      sameAs: [
        'https://www.instagram.com/alexg.mov/',
        'https://www.tiktok.com/@alexg.mov',
        'https://www.linkedin.com/in/alex-garrett-a21564243/',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      name: SITE_NAME,
      url: SITE_ORIGIN,
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    },
  ];
}

function breadcrumbSchema(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function pageSeo(page) {
  const plugins = window.PLUGINS || [];
  const luts = window.LUTS || [];
  const flowState = plugins.find(p => p.id === 'flowstate');
  const meridian = luts.find(l => l.id === 'cinematic-01');
  const pageKey = page || 'home';

  const defaults = {
    title: 'alexg.mov | Premiere Pro Plugins & Cinematic LUTs for Editors',
    description: 'Premiere Pro plugins and cinematic LUTs for video editors, filmmakers, and creators who want faster workflows and polished color.',
    canonical: absoluteRoute('home'),
    image: SITE_IMAGE,
    graph: baseGraph(),
  };

  if (pageKey === 'plugins') {
    const itemList = {
      '@type': 'ItemList',
      name: 'Premiere Pro plugins by alexg.mov',
      itemListElement: plugins.map((plugin, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: plugin.status === 'released' ? pluginProductSchema(plugin) : {
          '@type': 'SoftwareApplication',
          name: `${plugin.name} Premiere Pro plugin`,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'macOS 13+, Windows 10/11',
        },
      })),
    };
    return {
      ...defaults,
      title: 'Premiere Pro Plugins for Editors | FlowState AI Clip Search',
      description: 'Small Premiere Pro plugins for editors, including FlowState: an AI media browser for searching footage by meaning instead of filenames.',
      canonical: absoluteRoute('plugins'),
      graph: [...baseGraph(), itemList, faqSchema(window.PLUGIN_FAQS)].filter(Boolean),
    };
  }

  if (pageKey.startsWith('plugin:')) {
    const id = pageKey.slice(7);
    const plugin = plugins.find(p => p.id === id) || flowState;
    if (plugin) {
      return {
        ...defaults,
        title: `${plugin.name} Premiere Pro Plugin | AI Footage Search for Editors`,
        description: `${plugin.name} helps Premiere Pro editors search, organize, and reuse footage faster without leaving the edit.`,
        canonical: absoluteRoute(`plugin:${plugin.id}`),
        graph: [
          ...baseGraph(),
          pluginProductSchema(plugin),
          breadcrumbSchema([
            { name: 'Home', url: absoluteRoute('home') },
            { name: 'Plugins', url: absoluteRoute('plugins') },
            { name: plugin.name, url: absoluteRoute(`plugin:${plugin.id}`) },
          ]),
          faqSchema(window.PLUGIN_DETAIL_FAQS),
        ].filter(Boolean),
      };
    }
  }

  if (pageKey === 'luts') {
    const itemList = {
      '@type': 'ItemList',
      name: 'Cinematic LUTs by alexg.mov',
      itemListElement: luts.map((lut, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: lut.available ? lutProductSchema(lut) : {
          '@type': 'Product',
          name: `${lut.name} cinematic LUT`,
          category: 'Digital color grading LUT',
        },
      })),
    };
    return {
      ...defaults,
      title: 'Cinematic LUTs for Premiere, Resolve & Final Cut | alexg.mov',
      description: 'Cinematic .CUBE LUTs for video editors using Premiere Pro, DaVinci Resolve, and Final Cut Pro. Start with Meridian for warm daylight and travel footage.',
      canonical: absoluteRoute('luts'),
      graph: [...baseGraph(), itemList, faqSchema(window.LUT_FAQS)].filter(Boolean),
    };
  }

  if (pageKey.startsWith('lut:')) {
    const id = pageKey.slice(4);
    const lut = luts.find(l => l.id === id) || meridian;
    if (lut) {
      return {
        ...defaults,
        title: `${lut.name} LUT | Cinematic .CUBE LUT for Premiere, Resolve & Final Cut`,
        description: `${lut.name} is a cinematic .CUBE LUT for polished daylight, travel, lifestyle, and creator footage in Premiere Pro, DaVinci Resolve, and Final Cut Pro.`,
        canonical: absoluteRoute(`lut:${lut.id}`),
        image: imageUrl(lut.mockupSrc),
        graph: [
          ...baseGraph(),
          lutProductSchema(lut),
          breadcrumbSchema([
            { name: 'Home', url: absoluteRoute('home') },
            { name: 'LUTs', url: absoluteRoute('luts') },
            { name: lut.name, url: absoluteRoute(`lut:${lut.id}`) },
          ]),
          faqSchema(window.LUT_DETAIL_FAQS),
        ].filter(Boolean),
      };
    }
  }

  if (pageKey === 'portfolio') {
    return {
      ...defaults,
      title: 'Video Portfolio | Launch Films, Reels & Motion Graphics',
      description: 'Selected video work by Alex Garrett: launch films, social reels, real estate promos, motion graphics, and cinematic short-form edits.',
      canonical: absoluteRoute('portfolio'),
    };
  }

  if (pageKey === 'services') {
    return {
      ...defaults,
      title: 'Video Production & Editing Services | alexg.mov',
      description: 'Video production, editing, launch films, motion graphics, and content systems for startups, creators, and real estate teams.',
      canonical: absoluteRoute('services'),
    };
  }

  if (pageKey === 'support') {
    return {
      ...defaults,
      title: 'Support for alexg.mov Plugins & LUTs',
      description: 'Support for alexg.mov Premiere Pro plugins and LUTs. Email Alex with your OS, Premiere version, order email, and a screen recording.',
      canonical: absoluteRoute('support'),
      graph: [...baseGraph(), faqSchema(window.FAQS)].filter(Boolean),
    };
  }

  return defaults;
}

function applyPageSeo(page) {
  const seo = pageSeo(page);
  document.title = seo.title;
  upsertMeta('meta[name="description"]', { name: 'description' }, seo.description);
  upsertMeta('meta[name="robots"]', { name: 'robots' }, 'index,follow,max-image-preview:large');
  upsertLink('canonical', seo.canonical);

  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, SITE_NAME);
  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, seo.title);
  upsertMeta('meta[property="og:description"]', { property: 'og:description' }, seo.description);
  upsertMeta('meta[property="og:url"]', { property: 'og:url' }, seo.canonical);
  upsertMeta('meta[property="og:image"]', { property: 'og:image' }, seo.image);
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, seo.title);
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, seo.description);
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, seo.image);

  let script = document.getElementById('seo-jsonld');
  if (!script) {
    script = document.createElement('script');
    script.id = 'seo-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': seo.graph }).replace(/</g, '\\u003c');
}

function BuyerGuide({ eyebrow, title, intro, items = [], faqs = [], contained = false }) {
  const content = (
    <>
        <div className="seo-head">
          <p className="section-title">{eyebrow}</p>
          <h2>{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
        {items.length > 0 && (
          <div className="seo-grid">
            {items.map((item, index) => (
              <div className="seo-panel" key={index}>
                <div className="seo-kicker">{String(index + 1).padStart(2, '0')}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        )}
        {faqs.length > 0 && (
          <div className="seo-faq">
            {faqs.map((faq, index) => (
              <details key={index} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        )}
    </>
  );

  return (
    <section className="seo-section">
      {contained ? content : <div className="wrap">{content}</div>}
    </section>
  );
}

Object.assign(window, {
  SITE_ORIGIN,
  routeHref,
  absoluteRoute,
  applyPageSeo,
  BuyerGuide,
});
