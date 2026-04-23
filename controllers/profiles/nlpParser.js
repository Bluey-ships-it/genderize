// Maps country names (and common variations) to ISO codes
const COUNTRY_MAP = {
	nigeria: "NG",
	nigerian: "NG",
	kenya: "KE",
	kenyan: "KE",
	ghana: "GH",
	ghanaian: "GH",
	ethiopia: "ET",
	ethiopian: "ET",
	tanzania: "TZ",
	tanzanian: "TZ",
	"south africa": "ZA",
	"south african": "ZA",
	uganda: "UG",
	ugandan: "UG",
	senegal: "SN",
	senegalese: "SN",
	cameroon: "CM",
	cameroonian: "CM",
	angola: "AO",
	angolan: "AO",
	zambia: "ZM",
	zambian: "ZM",
	zimbabwe: "ZW",
	zimbabwean: "ZW",
	mozambique: "MZ",
	mozambican: "MZ",
	rwanda: "RW",
	rwandan: "RW",
	mali: "ML",
	malian: "ML",
	"ivory coast": "CI",
	"cote d'ivoire": "CI",
	"côte d'ivoire": "CI",
	benin: "BJ",
	beninese: "BJ",
	morocco: "MA",
	moroccan: "MA",
	egypt: "EG",
	egyptian: "EG",
	sudan: "SD",
	sudanese: "SD",
	algeria: "DZ",
	algerian: "DZ",
	tunisia: "TN",
	tunisian: "TN",
	libya: "LY",
	libyan: "LY",
	"burkina faso": "BF",
	niger: "NE",
	chad: "TD",
	chadian: "TD",
	madagascar: "MG",
	malagasy: "MG",
	malawi: "MW",
	malawian: "MW",
	botswana: "BW",
	botswanan: "BW",
	namibia: "NA",
	namibian: "NA",
	somalia: "SO",
	somali: "SO",
	"dr congo": "CD",
	"democratic republic of congo": "CD",
	drc: "CD",
	congo: "CG",
	"republic of the congo": "CG",
	gabon: "GA",
	gabonese: "GA",
	guinea: "GN",
	guinean: "GN",
	"sierra leone": "SL",
	liberia: "LR",
	liberian: "LR",
	togo: "TG",
	togolese: "TG",
	eritrea: "ER",
	eritrean: "ER",
	djibouti: "DJ",
	djiboutian: "DJ",
	burundi: "BI",
	burundian: "BI",
	"south sudan": "SS",
	gambia: "GM",
	gambian: "GM",
	"united states": "US",
	usa: "US",
	america: "US",
	american: "US",
	"united kingdom": "GB",
	uk: "GB",
	britain: "GB",
	british: "GB",
	france: "FR",
	french: "FR",
	germany: "DE",
	german: "DE",
	india: "IN",
	indian: "IN",
	china: "CN",
	chinese: "CN",
	japan: "JP",
	japanese: "JP",
	brazil: "BR",
	brazilian: "BR",
	canada: "CA",
	canadian: "CA",
	australia: "AU",
	australian: "AU",
};

function parseNaturalLanguage(q) {
	if (!q || q.trim() === "") return null;

	const query = q.toLowerCase().trim();
	const filters = {};

	// --- Gender ---
	if (/\bmales?\b/.test(query) && !/\bfemales?\b/.test(query)) {
		filters.gender = "male";
	} else if (/\bfemales?\b/.test(query) && !/\bmales?\b/.test(query)) {
		filters.gender = "female";
	}

	// "above N" / "over N" / "older than N"
	const aboveMatch = query.match(/(?:above|over|older than)\s+(\d+)/);
	if (aboveMatch) filters.min_age = parseInt(aboveMatch[1]);

	// "below N" / "under N" / "younger than N"
	const belowMatch = query.match(/(?:below|under|younger than)\s+(\d+)/);
	if (belowMatch) filters.max_age = parseInt(belowMatch[1]);

	// "between N and M"
	const betweenMatch = query.match(/between\s+(\d+)\s+and\s+(\d+)/);
	if (betweenMatch) {
		filters.min_age = parseInt(betweenMatch[1]);
		filters.max_age = parseInt(betweenMatch[2]);
	}

	// "young" maps to ages 16-24 (per spec), only if no numeric age set 
	if (/\byoung\b/.test(query) && !filters.min_age && !filters.max_age) {
		filters.min_age = 16;
		filters.max_age = 24;
	}

	// --- Age group keywords (only if no numeric age range already set) ---
	if (!filters.min_age && !filters.max_age) {
		if (/\bchildren?\b|\bkids?\b/.test(query)) filters.age_group = "child";
		else if (/\bteenagers?\b|\bteens?\b/.test(query))
			filters.age_group = "teenager";
		else if (/\bseniors?\b|\belderly\b|\bold people\b/.test(query))
			filters.age_group = "senior";
		else if (/\badults?\b/.test(query)) filters.age_group = "adult";
	}

	// If age group word appears alongside numeric constraint, honour both
	if (filters.min_age || filters.max_age) {
		if (/\bteenagers?\b|\bteens?\b/.test(query)) filters.age_group = "teenager";
		else if (/\bseniors?\b|\belderly\b/.test(query))
			filters.age_group = "senior";
		else if (/\badults?\b/.test(query)) filters.age_group = "adult";
	}

	//  Country: check multi-word countries first, then single-word ---
	const sortedCountries = Object.keys(COUNTRY_MAP).sort(
		(a, b) => b.length - a.length,
	);
	for (const name of sortedCountries) {
		if (query.includes(name)) {
			filters.country_id = COUNTRY_MAP[name];
			break;
		}
	}

	if (Object.keys(filters).length === 0) return null;

	return filters;
}

module.exports = parseNaturalLanguage;
