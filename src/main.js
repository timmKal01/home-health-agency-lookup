import { Actor, log } from 'apify';
import { fetchAgencies } from './cms.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { name, state, minRating, maxResults = 25 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const AGENCY_SEARCH_EVENT = 'agency-search';

const agencies = await fetchAgencies({
    name,
    state,
    minRating,
    maxResults: Math.min(maxResults, 100),
});

for (const agency of agencies) {
    await Actor.pushData(agency);
}

await Actor.charge({ eventName: AGENCY_SEARCH_EVENT });

log.info(`Pushed ${agencies.length} agency(s)`);

await Actor.exit();
