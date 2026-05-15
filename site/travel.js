// Travel log — edit this file to update the site.
//
// startsOn controls the automatic status:
//   before current item — "past"
//   current item        — "here"
//   after current item  — "next"
//
// key must match an entry in the LOCATIONS map in home.jsx.
// To add a new city, add it here AND add its map profile in LOCATIONS.
//
// when: display label shown in the list (e.g. "JAN 2026", "APR 17–MAY 6")
// startsOn: ISO date that flips this row to the current location.

export const TRAVEL_TIME_ZONE = 'Australia/Sydney';

export const TRAVEL_ITINERARY = [
  { key: 'rio',         when: 'FEB 7–22',      startsOn: '2026-02-07' },
  { key: 'victoria-bc', when: 'FEB 22–MAR 1',  startsOn: '2026-02-22' },
  { key: 'new-york',   when: 'MAR 1–15',       startsOn: '2026-03-01' },
  { key: 'salt-lake',  when: 'MAR 15–APR 1',   startsOn: '2026-03-15' },
  { key: 'victoria-bc', when: 'APR 1–15',      startsOn: '2026-04-01' },
  { key: 'bangkok',    when: 'APR 15–17',      startsOn: '2026-04-15' },
  { key: 'ko-samui',   when: 'APR 17–MAY 6',   startsOn: '2026-04-17' },
  { key: 'sydney',     when: 'MAY 6–JUN 6',    startsOn: '2026-05-06' },
  { key: 'madrid',     when: 'JUN 7–JUL 6',    startsOn: '2026-06-07' },
  { key: 'croatia',    when: 'JUL 6–AUG 6',    startsOn: '2026-07-06' },
];

function dateValueInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  );

  return Date.UTC(values.year, values.month - 1, values.day);
}

function parseIsoDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function getCurrentTravelIndex(rows, currentDateValue) {
  let currentIndex = -1;

  rows.forEach((row, index) => {
    if (parseIsoDate(row.startsOn) <= currentDateValue) {
      currentIndex = index;
    }
  });

  return currentIndex === -1 ? 0 : currentIndex;
}

export function getTravelItinerary(now = new Date()) {
  const currentDateValue = dateValueInTimeZone(now, TRAVEL_TIME_ZONE);
  const currentIndex = getCurrentTravelIndex(TRAVEL_ITINERARY, currentDateValue);

  return TRAVEL_ITINERARY.map((row, index) => ({
    ...row,
    status: index < currentIndex ? 'past' : index === currentIndex ? 'here' : 'next',
  }));
}

if (typeof window !== 'undefined') {
  window.ALEXG_TRAVEL = getTravelItinerary();
}
