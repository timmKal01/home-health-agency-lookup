const BASE_URL = 'https://data.cms.gov/provider-data/api/1/datastore/query/6jpm-sxkc/0';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retries transient failures (rate limits, upstream 5xx) instead of failing the whole run on one hiccup. */
async function fetchWithRetry(url) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let res;
        try {
            res = await fetch(url, { headers: { Connection: 'close' } });
        } catch (err) {
            lastError = err;
            if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
            continue;
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`CMS API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`CMS API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

function toNumber(value) {
    return value !== '' && value != null ? Number(String(value).replace(/,/g, '')) : null;
}

export async function fetchAgencies({ name, state, minRating, maxResults }) {
    const conditions = [];
    if (name) conditions.push({ property: 'provider_name', value: `%${name}%`, operator: 'like' });
    if (state) conditions.push({ property: 'state', value: state.toUpperCase(), operator: '=' });
    if (minRating) conditions.push({ property: 'quality_of_patient_care_star_rating', value: String(minRating), operator: '>=' });

    const url = new URL(BASE_URL);
    conditions.forEach((c, idx) => {
        url.searchParams.set(`conditions[${idx}][property]`, c.property);
        url.searchParams.set(`conditions[${idx}][value]`, c.value);
        url.searchParams.set(`conditions[${idx}][operator]`, c.operator);
    });
    url.searchParams.set('limit', String(maxResults));

    const res = await fetchWithRetry(url);
    const body = await res.json();

    return (body.results ?? []).map((a) => ({
        facilityId: a.cms_certification_number_ccn,
        name: a.provider_name,
        address: a.address,
        city: a.citytown,
        state: a.state,
        zipCode: a.zip_code,
        phone: a.telephone_number,
        ownershipType: a.type_of_ownership,
        certificationDate: a.certification_date,
        servicesOffered: {
            nursingCare: a.offers_nursing_care_services === 'Yes',
            physicalTherapy: a.offers_physical_therapy_services === 'Yes',
            occupationalTherapy: a.offers_occupational_therapy_services === 'Yes',
            speechPathology: a.offers_speech_pathology_services === 'Yes',
            medicalSocialServices: a.offers_medical_social_services === 'Yes',
            homeHealthAide: a.offers_home_health_aide_services === 'Yes',
        },
        qualityOfPatientCareRating: toNumber(a.quality_of_patient_care_star_rating),
        medicareSpendingRatio: toNumber(a.how_much_medicare_spends_on_an_episode_of_care_at_this_agen_56e6),
        dischargeToCommunityVsNational: a.dtc_performance_categorization || null,
        preventableReadmissionsVsNational: a.ppr_performance_categorization || null,
        preventableHospitalizationsVsNational: a.pph_performance_categorization || null,
    }));
}
