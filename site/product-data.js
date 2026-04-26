// Small shared data payload used before lazy route chunks load.

const PLUGINS = [
  {
    id: 'flowstate',
    name: 'FlowState',
    oneline: 'Analyze Premiere bin footage with AI, then search clips by meaning instead of filenames.',
    price: 28,
    version: '1.0.0',
    badge: 'RELEASED',
    status: 'released',
    variant: 'ai-media-browser',
    what: 'FlowState scans a selected bin subtree, uploads clips to Gemini, extracts qualitative footage metadata, and builds a semantic search catalog.',
    who: 'Editors who need to find useful A-roll, B-roll, transcripts, lighting, motion, and shot details across raw media.',
    get: 'Premiere CEP panel · Gemini Files API workflow · searchable catalog.json · non-destructive Premiere results bin.',
    install: [
      'Download the installer (.dmg for Mac, .exe for Windows).',
      'Close Premiere if it is currently running.',
      'Double-click the installer. Follow the two prompts.',
      'Reopen Premiere. Window → Extensions → FlowState.',
      'Select a bin subtree, run analysis, then search and send matches to a results bin.',
    ],
    specs: [
      'Adobe Premiere Pro 2024 (24.0) or later',
      'macOS 13+ · Windows 10/11',
      'Gemini API access required',
      'Writes data/catalog.json',
    ],
  },
  {
    id: 'demonclipper',
    name: 'Demon Clip',
    oneline: 'A faster way to carve long sessions into usable selects.',
    price: null,
    version: 'COMING SOON',
    badge: 'COMING SOON',
    status: 'coming-soon',
    variant: 'toolkit',
    what: 'Demon Clip is built for turning long raw sessions into tighter selects before the real edit begins.',
    who: 'Editors working through interviews, multicam podcasts, and long-form creator shoots.',
    get: 'Premiere extension for Mac & Windows · early access for launch list subscribers.',
    install: [
      'Join the launch list.',
      'Get the release email when Demon Clip ships.',
      'Download the installer for Mac or Windows.',
      'Open Window → Extensions → Demon Clip in Premiere.',
      'Start clipping down long sessions into selects.',
    ],
    specs: [
      'Premiere Pro 2024 (24.0)+',
      'macOS 13+ / Windows 10/11',
      'Release timing: 2026',
      'Launch build is in active development',
    ],
  },
];

const PLUGIN_FAQS = [
  {
    q: 'What is the best Premiere Pro plugin for searching footage by meaning?',
    a: 'FlowState is designed for that use case. It analyzes a selected Premiere bin subtree, builds footage metadata, and lets editors search clips by what is in them instead of by filename.',
  },
  {
    q: 'Does FlowState replace a normal editing workflow?',
    a: 'No. It is a workflow plugin for finding and organizing footage faster inside Premiere Pro. It does not replace editing judgment, logging, or the final timeline work.',
  },
  {
    q: 'Who should use an AI media browser plugin?',
    a: 'Editors working with large bins, interviews, B-roll libraries, product footage, launch films, and creator shoots get the most value because search becomes descriptive instead of filename-based.',
  },
];

const PLUGIN_DETAIL_FAQS = [
  {
    q: 'What does FlowState do in Premiere Pro?',
    a: 'FlowState scans selected Premiere bin footage with AI, extracts qualitative metadata, builds a semantic catalog, and lets editors search clips by meaning.',
  },
  {
    q: 'What does FlowState help me find?',
    a: 'It is built for finding A-roll, B-roll, shot type, motion, transcript-like context, lighting, subject matter, and other clip details that filenames usually do not capture.',
  },
  {
    q: 'What software do I need?',
    a: 'FlowState is built for Adobe Premiere Pro 2024 or later on macOS 13+ or Windows 10/11. Gemini API access is required for analysis.',
  },
];

const LUTS = [
  {
    id: 'cinematic-01',
    name: 'Meridian',
    oneline: 'Give clean daylight footage warm contrast, richer skin, and polished travel-film color.',
    price: 18,
    formats: '.CUBE',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    available: true,
    checkoutProductId: 'solene',
    mockupSrc: 'mockups/meridian mockup.png',
    mockupAlt: 'Meridian LUT product mockup',
    demoLabel: 'Meridian',
    compare: {
      title: 'Meridian',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Meridian ungraded preview',
      afterTitle: 'Meridian graded preview',
      beforeSrc: 'videos/Solène Ungraded.mp4',
      afterSrc: 'videos/Solène Graded.mp4',
    },
  },
  {
    id: 'interior-03',
    name: 'Haloclyne',
    oneline: 'A softer interior-grade LUT for natural light, talking heads, and lifestyle footage.',
    price: null,
    formats: '.CUBE',
    badge: 'COMING SOON',
    tone: 'warm-film',
    available: false,
    release: 'Q2',
    demoLabel: 'Haloclyne',
  },
];

const LUT_FAQS = [
  {
    q: 'What is the best LUT for daylight travel footage?',
    a: 'Meridian is the best fit in this shop for daylight travel, lifestyle, creator, and outdoor footage that already has a clean exposure and white balance.',
  },
  {
    q: 'Do these LUTs work in Premiere Pro, DaVinci Resolve, and Final Cut Pro?',
    a: 'Yes. The released LUTs ship as .CUBE files, which can be loaded in Adobe Premiere Pro, DaVinci Resolve, Final Cut Pro, and most modern color workflows.',
  },
  {
    q: 'Should I apply a LUT before or after color correction?',
    a: 'Apply the LUT after a base correction or log-to-Rec.709 transform. This keeps skin tones and shadows easier to control than treating the LUT like a full correction.',
  },
];

const LUT_DETAIL_FAQS = [
  {
    q: 'Who is Meridian best for?',
    a: 'Meridian is best for editors, filmmakers, and creators who want one cinematic LUT for daylight, travel, lifestyle, and social video rather than a huge LUT bundle.',
  },
  {
    q: 'What software can open Meridian?',
    a: 'Meridian ships as a .CUBE LUT, so it can be used in Premiere Pro, DaVinci Resolve, Final Cut Pro, and other color tools that accept .CUBE files.',
  },
  {
    q: 'How strong should the LUT be?',
    a: 'For most shots, start around 30 to 60 percent intensity, then adjust exposure and white balance so the look feels intentional instead of crushed.',
  },
];

const FAQS = [
  { q: 'Do your plugins work on Windows?', a: 'Yes. Every plugin ships with a signed installer for Mac and Windows. Premiere Pro 2024 (24.0) or later.' },
  { q: 'Can I use the LUTs in client work?', a: 'Yes. Personal and commercial use are both allowed. Don\'t redistribute the files themselves or resell the pack.' },
  { q: 'Do you offer refunds?', a: 'No. These are digital downloads. Once the files hit your machine, there is no way to un-deliver them. If you hit an install bug or something is broken on my end, email me and I will fix it or replace the file.' },
  { q: 'How fast do you respond to support?', a: 'Within 24 hours on weekdays. Often same-day. Include your OS, Premiere version, and a screen recording. It cuts debugging time in half.' },
];

Object.assign(window, {
  PLUGINS,
  PLUGIN_FAQS,
  PLUGIN_DETAIL_FAQS,
  LUTS,
  LUT_FAQS,
  LUT_DETAIL_FAQS,
  FAQS,
});
