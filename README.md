# Home Health Agency Lookup — CMS Star Ratings

Search U.S. home health agencies (in-home nursing, therapy, and aide
services) by name or state and get their official CMS quality-of-care
star rating, which services they offer, and how they compare to the
national rate on preventable readmissions and hospitalizations.

Built for families arranging post-hospital or ongoing in-home care for
a loved one, discharge planners, and care coordinators.

## Input

```json
{
  "name": "",
  "state": "CA",
  "minRating": 4,
  "maxResults": 25
}
```

| Field | Type | Description |
|---|---|---|
| `name` | string (optional) | Full or partial agency name to search for. |
| `state` | string (optional) | Two-letter US state code to limit to agencies located there. |
| `minRating` | number (optional) | Only return agencies with at least this CMS quality-of-care rating (1-5 stars, half-star increments). |
| `maxResults` | number | Max agencies to return. Default `25`, max `100`. |

## Output

One record per agency:

```json
{
  "facilityId": "027001",
  "name": "PROVIDENCE AT HOME WITH COMPASSUS HH ANCHORAGE",
  "address": "4001 DALE STREET, SUITE 101",
  "city": "ANCHORAGE",
  "state": "AK",
  "zipCode": "99508",
  "phone": "9073314075",
  "ownershipType": "PROPRIETARY",
  "certificationDate": "05/17/1982",
  "servicesOffered": {
    "nursingCare": true,
    "physicalTherapy": true,
    "occupationalTherapy": true,
    "speechPathology": true,
    "medicalSocialServices": true,
    "homeHealthAide": true
  },
  "qualityOfPatientCareRating": 3.5,
  "medicareSpendingRatio": 0.94,
  "dischargeToCommunityVsNational": "Better Than National Rate",
  "preventableReadmissionsVsNational": "Same As National Rate",
  "preventableHospitalizationsVsNational": "Better Than National Rate"
}
```

`medicareSpendingRatio` is relative to the national average episode cost
(1.0 = average; below 1.0 spends less per episode than typical).

A search with no matches returns no items but is still billed once for
the search.

## How it works

Direct calls to the official [CMS Provider Data
API](https://data.cms.gov/provider-data/) (`data.cms.gov`), querying
the Home Health Care Agencies dataset — no proxy, no key, no scraping.
Public U.S. government data, refreshed quarterly by CMS.

## Pricing note

Billed per **search**, not per agency returned — one charge whether the
search returns 0 agencies or 100.

## Related products

- [Nursing Home Quality Lookup](https://github.com/timmKal01/nursing-home-quality-lookup) — the long-term/residential care equivalent
- [Hospital Quality Lookup](https://github.com/timmKal01/hospital-quality-lookup) — the acute-care hospital equivalent
