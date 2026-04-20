// Travel log — edit this file to update the site.
//
// status options:
//   "past"  — already visited
//   "here"  — current location (only one at a time)
//   "next"  — upcoming
//
// key must match an entry in the LOCATIONS map in home.jsx.
// To add a new city, add it here AND add its map profile in LOCATIONS.
//
// when: display label shown in the list (e.g. "JAN 2026", "APR 17–MAY 6")

window.ALEXG_TRAVEL = [
  { key: 'rio',         when: 'FEB 7–22',      status: 'past' },
  { key: 'victoria-bc', when: 'FEB 22–MAR 1',  status: 'past' },
  { key: 'new-york',   when: 'MAR 1–15',       status: 'past' },
  { key: 'salt-lake',  when: 'MAR 15–APR 1',   status: 'past' },
  { key: 'victoria-bc', when: 'APR 1–15',      status: 'past' },
  { key: 'bangkok',    when: 'APR 15–17',       status: 'past' },
  { key: 'ko-samui',   when: 'APR 17–MAY 6',   status: 'here' },
  { key: 'sydney',     when: 'MAY 6–JUN 6',    status: 'next' },
];
