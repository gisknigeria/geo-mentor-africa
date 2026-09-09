"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Loader,
  Mail,
} from "lucide-react";

const countryRegions: Record<string, string[]> = {
  Algeria: [
    "Adrar",
    "Algiers",
    "Annaba",
    "Batna",
    "Bejaia",
    "Blida",
    "Constantine",
    "Djelfa",
    "Oran",
    "Ouargla",
    "Setif",
    "Tlemcen",
  ],
  Angola: [
    "Bengo",
    "Benguela",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Huambo",
    "Huila",
    "Luanda",
    "Malanje",
    "Namibe",
    "Uige",
  ],
  Benin: [
    "Alibori",
    "Atakora",
    "Atlantique",
    "Borgou",
    "Collines",
    "Couffo",
    "Donga",
    "Littoral",
    "Mono",
    "Oueme",
    "Plateau",
    "Zou",
  ],
  Botswana: [
    "Central",
    "Chobe",
    "Gaborone",
    "Ghanzi",
    "Kgalagadi",
    "Kgatleng",
    "Kweneng",
    "North East",
    "North West",
    "Southern",
  ],
  "Burkina Faso": [
    "Boucle du Mouhoun",
    "Cascades",
    "Centre",
    "Centre-Est",
    "Centre-Nord",
    "Centre-Ouest",
    "Centre-Sud",
    "Est",
    "Hauts-Bassins",
    "Nord",
    "Plateau-Central",
    "Sahel",
    "Sud-Ouest",
  ],
  Burundi: [
    "Bujumbura Mairie",
    "Bujumbura Rural",
    "Bururi",
    "Cankuzo",
    "Cibitoke",
    "Gitega",
    "Karuzi",
    "Kayanza",
    "Kirundo",
    "Makamba",
    "Muyinga",
    "Ngozi",
    "Rutana",
    "Ruyigi",
  ],
  "Cabo Verde": [
    "Boa Vista",
    "Brava",
    "Fogo",
    "Maio",
    "Mosteiros",
    "Paul",
    "Praia",
    "Ribeira Grande",
    "Sal",
    "Sao Vicente",
    "Tarrafal",
  ],
  Cameroon: [
    "Adamawa",
    "Centre",
    "East",
    "Far North",
    "Littoral",
    "North",
    "North-West",
    "South",
    "South-West",
    "West",
  ],
  "Central African Republic": [
    "Bangui",
    "Bamingui-Bangoran",
    "Basse-Kotto",
    "Haut-Mbomou",
    "Kemo",
    "Lobaye",
    "Mambere-Kadei",
    "Ombella-M'Poko",
    "Ouaka",
    "Ouham",
    "Ouham-Pende",
    "Sangha-Mbaere",
  ],
  Chad: [
    "Bahr el Gazel",
    "Batha",
    "Borkou",
    "Chari-Baguirmi",
    "Ennedi-Est",
    "Ennedi-Ouest",
    "Guera",
    "Hadjer-Lamis",
    "Kanem",
    "Lac",
    "Logone Occidental",
    "Logone Oriental",
    "N'Djamena",
    "Ouaddai",
    "Salamat",
    "Sila",
    "Tandjile",
    "Tibesti",
    "Wadi Fira",
  ],
  Comoros: ["Anjouan", "Grande Comore", "Moheli"],
  "Democratic Republic of the Congo": [
    "Bas-Uele",
    "Equateur",
    "Haut-Katanga",
    "Haut-Lomami",
    "Haut-Uele",
    "Ituri",
    "Kasai",
    "Kasai-Central",
    "Kasai-Oriental",
    "Kinshasa",
    "Kongo Central",
    "Kwango",
    "Kwilu",
    "Lomami",
    "Lualaba",
    "Mai-Ndombe",
    "Maniema",
    "Mongala",
    "Nord-Kivu",
    "Nord-Ubangi",
    "Sankuru",
    "Sud-Kivu",
    "Sud-Ubangi",
    "Tanganyika",
    "Tshopo",
    "Tshuapa",
  ],
  Djibouti: ["Ali Sabieh", "Arta", "Dikhil", "Djibouti", "Obock", "Tadjourah"],
  Egypt: [
    "Alexandria",
    "Aswan",
    "Asyut",
    "Beheira",
    "Cairo",
    "Dakahlia",
    "Faiyum",
    "Giza",
    "Ismailia",
    "Luxor",
    "Minya",
    "Port Said",
    "Qalyubia",
    "Qena",
    "Red Sea",
    "Sohag",
    "South Sinai",
    "Suez",
  ],
  "Equatorial Guinea": [
    "Annobon",
    "Bioko Norte",
    "Bioko Sur",
    "Centro Sur",
    "Kie-Ntem",
    "Litoral",
    "Wele-Nzas",
  ],
  Eritrea: [
    "Anseba",
    "Central",
    "Debub",
    "Gash-Barka",
    "Northern Red Sea",
    "Southern Red Sea",
  ],
  Eswatini: ["Hhohho", "Lubombo", "Manzini", "Shiselweni"],
  Ethiopia: [
    "Addis Ababa",
    "Afar",
    "Amhara",
    "Benishangul-Gumuz",
    "Dire Dawa",
    "Gambela",
    "Harari",
    "Oromia",
    "Sidama",
    "Somali",
    "SNNPR",
    "Tigray",
  ],
  Gabon: [
    "Estuaire",
    "Haut-Ogooue",
    "Moyen-Ogooue",
    "Ngounie",
    "Nyanga",
    "Ogooue-Ivindo",
    "Ogooue-Lolo",
    "Ogooue-Maritime",
    "Woleu-Ntem",
  ],
  "The Gambia": [
    "Banjul",
    "Central River",
    "Lower River",
    "North Bank",
    "Upper River",
    "West Coast",
  ],
  Guinea: [
    "Boke",
    "Conakry",
    "Faranah",
    "Kankan",
    "Kindia",
    "Labe",
    "Mamou",
    "Nzerekore",
  ],
  "Guinea-Bissau": [
    "Bafata",
    "Biombo",
    "Bolama",
    "Cacheu",
    "Gabu",
    "Oio",
    "Quinara",
    "Tombali",
  ],
  "Ivory Coast": [
    "Abidjan",
    "Agnéby-Tiassa",
    "Bafing",
    "Cavally",
    "District des Montagnes",
    "Goh-Djiboua",
    "Gontougo",
    "Grands-Ponts",
    "Haut-Sassandra",
    "Lacs",
    "Lagunes",
    "Marahoue",
    "Poro",
    "San-Pedro",
    "Sassandra-Marahoue",
    "Savanes",
    "Sud-Comoe",
    "Tonkpi",
    "Worodougou",
    "Yamoussoukro",
    "Zanzan",
  ],
  Lesotho: [
    "Berea",
    "Butha-Buthe",
    "Leribe",
    "Mafeteng",
    "Maseru",
    "Mohale's Hoek",
    "Mokhotlong",
    "Qacha's Nek",
    "Quthing",
    "Thaba-Tseka",
  ],
  Liberia: [
    "Bomi",
    "Bong",
    "Gbarpolu",
    "Grand Bassa",
    "Grand Cape Mount",
    "Grand Gedeh",
    "Grand Kru",
    "Lofa",
    "Margibi",
    "Maryland",
    "Montserrado",
    "Nimba",
    "River Cess",
    "River Gee",
    "Sinoe",
  ],
  Libya: [
    "Ajdabiya",
    "Benghazi",
    "Derna",
    "Ghat",
    "Misrata",
    "Murzuq",
    "Nalut",
    "Sabha",
    "Tripoli",
    "Zawiya",
  ],
  Madagascar: [
    "Antananarivo",
    "Antsiranana",
    "Fianarantsoa",
    "Mahajanga",
    "Toamasina",
    "Toliara",
  ],
  Malawi: ["Central Region", "Northern Region", "Southern Region"],
  Mali: [
    "Bamako",
    "Gao",
    "Kayes",
    "Kidal",
    "Koulikoro",
    "Menaka",
    "Mopti",
    "Segou",
    "Sikasso",
    "Taoudenit",
    "Tombouctou",
  ],
  Mauritania: [
    "Adrar",
    "Assaba",
    "Brakna",
    "Dakhlet Nouadhibou",
    "Gorgol",
    "Guidimaka",
    "Hodh Ech Chargui",
    "Hodh El Gharbi",
    "Inchiri",
    "Nouakchott",
    "Tagant",
    "Tiris Zemmour",
    "Trarza",
  ],
  Mauritius: [
    "Black River",
    "Flacq",
    "Grand Port",
    "Moka",
    "Pamplemousses",
    "Plaines Wilhems",
    "Port Louis",
    "Riviere du Rempart",
    "Savanne",
  ],
  Morocco: [
    "Casablanca-Settat",
    "Dakhla-Oued Ed-Dahab",
    "Drâa-Tafilalet",
    "Fes-Meknes",
    "Guelmim-Oued Noun",
    "Laayoune-Sakia El Hamra",
    "Marrakesh-Safi",
    "Oriental",
    "Rabat-Sale-Kenitra",
    "Souss-Massa",
    "Tanger-Tetouan-Al Hoceima",
  ],
  Mozambique: [
    "Cabo Delgado",
    "Gaza",
    "Inhambane",
    "Manica",
    "Maputo",
    "Maputo City",
    "Nampula",
    "Niassa",
    "Sofala",
    "Tete",
    "Zambezia",
  ],
  Namibia: [
    "//Karas",
    "Erongo",
    "Hardap",
    "Kavango East",
    "Kavango West",
    "Khomas",
    "Kunene",
    "Ohangwena",
    "Omaheke",
    "Omusati",
    "Oshana",
    "Oshikoto",
    "Otjozondjupa",
    "Zambezi",
  ],
  Niger: [
    "Agadez",
    "Diffa",
    "Dosso",
    "Maradi",
    "Niamey",
    "Tahoua",
    "Tillaberi",
    "Zinder",
  ],
  "Republic of the Congo": [
    "Bouenza",
    "Brazzaville",
    "Cuvette",
    "Cuvette-Ouest",
    "Kouilou",
    "Lekoumou",
    "Likouala",
    "Niari",
    "Plateaux",
    "Pool",
    "Sangha",
  ],
  "Sao Tome and Principe": [
    "Agua Grande",
    "Cantagalo",
    "Caué",
    "Lemba",
    "Lobata",
    "Me-Zochi",
    "Principe",
  ],
  Senegal: [
    "Dakar",
    "Diourbel",
    "Fatick",
    "Kaffrine",
    "Kaolack",
    "Kedougou",
    "Kolda",
    "Louga",
    "Matam",
    "Saint-Louis",
    "Sedhiou",
    "Tambacounda",
    "Thies",
    "Ziguinchor",
  ],
  Seychelles: [
    "Anse Boileau",
    "Anse Royale",
    "Beau Vallon",
    "Cascade",
    "English River",
    "Mont Fleuri",
    "Plaisance",
    "Pointe La Rue",
    "Saint Louis",
  ],
  "Sierra Leone": [
    "Eastern",
    "North Eastern",
    "Northern",
    "North Western",
    "Southern",
    "Western Area",
  ],
  Somalia: [
    "Banadir",
    "Galguduud",
    "Hirshabelle",
    "Jubaland",
    "Puntland",
    "South West",
    "Somaliland",
  ],
  "South Sudan": [
    "Central Equatoria",
    "Eastern Equatoria",
    "Jonglei",
    "Lakes",
    "Northern Bahr el Ghazal",
    "Unity",
    "Upper Nile",
    "Warrap",
    "Western Bahr el Ghazal",
    "Western Equatoria",
  ],
  Sudan: [
    "Blue Nile",
    "Central Darfur",
    "Gedaref",
    "Gezira",
    "Khartoum",
    "North Darfur",
    "Northern",
    "Red Sea",
    "River Nile",
    "Sennar",
    "South Darfur",
    "South Kordofan",
    "West Darfur",
    "West Kordofan",
    "White Nile",
  ],
  Togo: ["Centrale", "Kara", "Maritime", "Plateaux", "Savanes"],
  Tunisia: [
    "Ariana",
    "Beja",
    "Ben Arous",
    "Bizerte",
    "Gabes",
    "Gafsa",
    "Jendouba",
    "Kairouan",
    "Kasserine",
    "Kebili",
    "Kef",
    "Mahdia",
    "Manouba",
    "Medenine",
    "Monastir",
    "Nabeul",
    "Sfax",
    "Sidi Bouzid",
    "Siliana",
    "Sousse",
    "Tataouine",
    "Tozeur",
    "Tunis",
    "Zaghouan",
  ],
  Nigeria: [
    "Abia",
    "Abuja FCT",
    "Adamawa",
    "Anambra",
    "Enugu",
    "Kaduna",
    "Kano",
    "Katsina",
    "Lagos",
    "Ogun",
    "Oyo",
    "Rivers",
  ],
  Ghana: [
    "Ashanti",
    "Brong-Ahafo",
    "Central",
    "Eastern",
    "Greater Accra",
    "Northern",
    "Volta",
    "Western",
  ],
  Kenya: [
    "Central",
    "Coast",
    "Eastern",
    "Nairobi",
    "Nyanza",
    "Rift Valley",
    "Western",
  ],
  Uganda: ["Central", "Eastern", "Northern", "Western", "Kampala"],
  Tanzania: [
    "Arusha",
    "Dar es Salaam",
    "Dodoma",
    "Mwanza",
    "Mbeya",
    "Zanzibar",
  ],
  Rwanda: ["Kigali", "Eastern", "Northern", "Southern", "Western"],
  "South Africa": [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape",
  ],
  Zambia: ["Central", "Copperbelt", "Eastern", "Lusaka", "Southern", "Western"],
  Zimbabwe: [
    "Bulawayo",
    "Harare",
    "Manicaland",
    "Mashonaland",
    "Matabeleland",
    "Midlands",
  ],
};

const countryCodes = `AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW`;
const countries = [
  ...countryCodes.split(" ").map((code) =>
    new Intl.DisplayNames(["en"], { type: "region" }).of(code),
  ).filter((country): country is string => Boolean(country)),
  "Other",
];
const africaCountryCodes: Record<string, string> = {
  Algeria: "DZA", Angola: "AGO", Benin: "BEN", Botswana: "BWA",
  "Burkina Faso": "BFA", Burundi: "BDI", Cameroon: "CMR", "Cape Verde": "CPV",
  "Central African Republic": "CAF", Chad: "TCD", Comoros: "COM", Congo: "COG",
  "Democratic Republic of the Congo": "COD", Djibouti: "DJI", Egypt: "EGY",
  "Equatorial Guinea": "GNQ", Eritrea: "ERI", Eswatini: "SWZ", Ethiopia: "ETH",
  Gabon: "GAB", Gambia: "GMB", Ghana: "GHA", Guinea: "GIN", "Guinea-Bissau": "GNB",
  Kenya: "KEN", Lesotho: "LSO", Liberia: "LBR", Libya: "LBY", Madagascar: "MDG",
  Malawi: "MWI", Mali: "MLI", Mauritania: "MRT", Mauritius: "MUS", Morocco: "MAR",
  Mozambique: "MOZ", Namibia: "NAM", Niger: "NER", Nigeria: "NGA", Rwanda: "RWA",
  "Sao Tome and Principe": "STP", Senegal: "SEN", Seychelles: "SYC", "Sierra Leone": "SLE",
  Somalia: "SOM", "South Africa": "ZAF", "South Sudan": "SSD", Sudan: "SDN",
  Tanzania: "TZA", Togo: "TGO", Tunisia: "TUN", Uganda: "UGA", Zambia: "ZMB", Zimbabwe: "ZWE",
};
const professionalFieldOptions = [
  "Academic, Technical & Professional Development",
  "Administration, Operations & Organisational Management",
  "Advocacy, Government Relations & Policy Engagement",
  "Agriculture, Agronomy, Agrobiodiversity & Food Systems",
  "Artificial Intelligence, Machine Learning & Digital Innovation",
  "Biodiversity, Ecology, Wildlife & Conservation Science",
  "Business Continuity, Crisis Management & Organisational Resilience",
  "Business, Entrepreneurship & Enterprise Development",
  "Communications, Media, Journalism & Public Engagement",
  "Community Development, Social Inclusion & Livelihoods",
  "Cybersecurity, Cloud Computing & Digital Infrastructure",
  "Data Protection, Risk, Governance & Compliance",
  "Data Science, Statistics, Analytics & Data Management",
  "Disaster Risk Reduction & Environmental Resilience",
  "Economics, Development Studies & Inclusive Growth",
  "Education, Teaching & Curriculum Development",
  "Emergency Management, Disaster Response & Crisis Coordination",
  "Engineering, Electronics, Automation & Infrastructure",
  "Environmental Science, Climate Change & Sustainability",
  "Finance, Accounting, Investment & Financial Management",
  "Finance, Audit & Internal Controls",
  "Fire Safety, Rescue & Emergency Services",
  "Forestry, Natural Resources, Land & Ecosystem Management",
  "Gender, Equity, Disability & Social Inclusion",
  "Geospatial Science, GIS, Surveying & Earth Observation",
  "Geography, Geology, Geosciences & Earth Sciences",
  "Green Enterprise, Agribusiness & Circular Economy",
  "Health, Public Health & One Health",
  "Human Resources, Talent & Volunteer Management",
  "Humanitarian Action & Community Resilience",
  "Humanitarian Security, Duty of Care & Operational Risk",
  "Indigenous Knowledge, Culture & Local Knowledge Systems",
  "Information Technology, Software & Digital Systems",
  "International Development & Development Cooperation",
  "Law, Ethics, Safeguarding & Regulatory Compliance",
  "Law Enforcement, Policing & Community Security",
  "Market Development, Value Chains, Trade & Market Access",
  "Meteorology, Climate & Atmospheric Sciences",
  "Monitoring, Evaluation, Learning & Impact Assessment",
  "Monitoring, Reporting & Knowledge Documentation",
  "Multidisciplinary / Cross-Sector Expertise",
  "Occupational Health, Safety & Environment (HSE)",
  "Other Professional Field",
  "Partnerships, Stakeholder Engagement & Institutional Development",
  "Procurement, Logistics & Supply Chain Management",
  "Programme, Project & Portfolio Management",
  "Products/Materials & In-Kind Support",
  "Public Policy, Governance & Sustainable Development",
  "Quality Assurance, Standards & Process Improvement",
  "Renewable Energy, Energy Systems & Clean Technology",
  "Research, Science, Innovation & Knowledge Management",
  "Resource Mobilisation, Funding & Sponsorship",
  "Security Intelligence, Risk Assessment & Incident Management",
  "Security Management, Protective Services & Public Safety",
  "Soil Science & Land Resources",
  "Technology, Research Support & Development",
  "Telecommunications, Connectivity & Utilities",
  "Training, Mentorship & Capacity Development",
  "Urban Planning, Architecture & Built Environment",
  "Water Resources, Hydrology, Fisheries & Marine Sciences",
  "Youth Development, Mentorship & Leadership",
  "Prefer to Specify",
].sort((first, second) => first.localeCompare(second));
const professionalPrefixOptions = [
  "Mr.", "Ms.", "Mrs.", "Miss", "Dr.", "Prof.", "Engr.", "Arc.",
  "Bldr.", "Surv.", "QS", "TPl.", "ESV", "Pharm.", "Barr.", "Rev.",
  "Pst.", "Bp.", "Fr.", "Imam", "Chief", "H.E.", "HRH", "Gen.",
  "Col.", "Maj.", "Capt.", "Lt.", "Other",
];
const jobTitleGroups = {
  "Executive & Leadership": ["Founder", "Co-Founder", "Chair / Chairperson", "President", "Vice President", "Chief Executive Officer (CEO)", "Managing Director", "Executive Director", "Director", "Deputy Director", "Country Director", "Regional Director", "Programme Director", "Technical Director", "Operations Director", "Head of Department", "Head of Unit", "Team Lead", "Coordinator", "Manager", "Deputy Manager", "Supervisor"],
  "Academic & Research": ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Senior Lecturer", "Researcher", "Senior Researcher", "Research Fellow", "Postdoctoral Researcher", "Principal Investigator", "Research Assistant", "Laboratory Scientist", "Academic Coordinator", "Dean", "Head of Department", "University Administrator"],
  "Students & Emerging Professionals": ["Undergraduate Student", "Postgraduate Student", "Master's Student", "Doctoral / PhD Student", "Intern", "Graduate Trainee", "Early-Career Professional", "Young Professional", "Volunteer", "Fellow"],
  Education: ["Principal", "Vice Principal", "Head Teacher", "Teacher", "Educator", "Instructor", "Trainer", "Facilitator", "Curriculum Specialist", "Education Officer", "School Administrator", "Guidance Counsellor", "Learning & Development Specialist"],
  "Technical & Scientific": ["Scientist", "Conservation Scientist", "Environmental Scientist", "Ecologist", "Biologist", "Forester", "Agronomist", "Soil Scientist", "Geographer", "Geologist", "GIS Specialist", "GIS Analyst", "Geospatial Analyst", "Remote Sensing Specialist", "Surveyor", "Data Scientist", "Data Analyst", "Software Engineer", "Full-Stack Developer", "AI / Machine Learning Engineer", "IoT Engineer", "Electronics Engineer", "Renewable Energy Engineer", "Environmental Engineer", "Technical Specialist", "Technical Officer", "Technical Consultant"],
  "Conservation, Environment & Agriculture": ["Conservation Officer", "Biodiversity Specialist", "Wildlife Specialist", "Forestry Officer", "Environmental Officer", "Climate Specialist", "Sustainability Specialist", "Restoration Specialist", "Natural Resources Specialist", "Agricultural Officer", "Agricultural Extension Officer", "Farm Manager", "Agribusiness Specialist", "Field Officer", "Field Coordinator"],
  "Programme, Project & Development": ["Programme Manager", "Project Manager", "Programme Officer", "Project Officer", "Programme Coordinator", "Project Coordinator", "Project Assistant", "Monitoring & Evaluation Specialist", "Monitoring, Evaluation & Learning (MEL) Specialist", "M&E Officer", "Impact Assessment Specialist", "Development Specialist", "Community Development Officer", "Youth Development Officer", "Safeguarding Officer"],
  "Partnerships & External Relations": ["Partnership Manager", "Partnership Officer", "Business Development Manager", "Business Development Officer", "Stakeholder Engagement Specialist", "Corporate Relations Manager", "Government Relations Officer", "Institutional Relations Officer", "Donor Relations Officer", "Resource Mobilisation Specialist", "Fundraising Manager", "Grants Manager", "Grants Officer"],
  "Business, Finance & Enterprise": ["Entrepreneur", "Business Owner", "Chief Financial Officer (CFO)", "Finance Manager", "Accountant", "Financial Analyst", "Investment Manager", "Investment Analyst", "Enterprise Development Specialist", "Agribusiness Manager", "Market Development Specialist", "Business Consultant"],
  "Policy, Government & Governance": ["Public Officer", "Civil Servant", "Policy Adviser", "Policy Analyst", "Policy Officer", "Government Official", "Commissioner", "Permanent Secretary", "Director-General", "Special Adviser", "Technical Adviser", "Programme Adviser", "Governance Specialist"],
  "Communications & Advocacy": ["Communications Director", "Communications Manager", "Communications Officer", "Public Relations Officer", "Media Officer", "Journalist", "Content Creator", "Social Media Manager", "Advocacy Officer", "Campaign Manager", "Community Engagement Officer"],
  "Legal & Compliance": ["Lawyer", "Legal Adviser", "Legal Officer", "Compliance Officer", "Ethics Officer", "Data Protection Officer", "Risk Manager"],
  Other: ["Consultant", "Independent Professional", "Retired Professional", "Community Leader", "Traditional Leader", "Religious Leader", "Volunteer", "Other"],
} as const;
const contributionOptions = [
  "School Adoption, Mentorship Support & Career Guidance", "Training & Knowledge Sharing", "Panelist / Resource Person", "Organise or Support Hackathons & Olympiads", "Organise or Support Seminars, Conferences", "Organise or Support Workshops & Masterclasses", "Organise or Support Field Demonstrations", "Organise or Support Professional Programmes", "Research & Scientific Collaboration", "Expert Validation & Technical Review", "Environmental Data & Analytics", "Knowledge & Intelligence Engine Support", "AI Platform Library Validation",
];
const participationOptions = [
  "Geo-Mentor",
  "Knowledge Expert",
  "Industry Mentor",
  "Geo-Partner & Institutional Collaboration",
];
const roleContributionOptions: Record<string, string[]> = {
  "Industry Mentor": [
    "Industry Expertise",
    "Incubation & Innovation",
    "Internship & Exchange",
  ],
  "Geo-Partner & Institutional Collaboration": [
    "Technology & Research Support and Development",
    "Resource Mobilisation, Funding and Sponsorship",
    "Products/Materials & In-Kind Support",
    "Advocacy & Programme Support",
    "Market Access & Enterprise Development",
  ],
};
const initialFormData = {
  fullName: "",
  email: "",
  organization: "",
  organizationAddress: "",
  phone: "",
  city: "",
  localGovernmentArea: "",
  prefix: "",
  jobTitle: "",
  professionalField: [] as string[],
  professionalFieldOther: "",
  areaOfExpertise: "",
  website: "",
  organizationWebsite: "",
  country: "",
  stateRegion: "",
  message: "",
  participationType: "",
  additionalParticipationType: "",
  wantsAdditionalRole: "",
  contributionAreas: [] as string[],
  programmeAreas: [] as string[],
  commitmentLevel: "",
  estimatedTime: "",
  geographicInterest: "",
  resourceOffers: [] as string[],
  additionalInformation: "",
  consentContact: false,
  consentStandards: false,
  consentData: false,
  wantsUpdates: false,
  interestedIn: {
    mentorship: false,
    fieldCapture: false,
    partnershipFunding: false,
    research: false,
  },
};

interface WaitlistFormState {
  isSubmitting: boolean;
  message: string;
  isSuccess: boolean;
  isError: boolean;
}

export function WaitlistForm() {
  const [formState, setFormState] = useState<WaitlistFormState>({
    isSubmitting: false,
    message: "",
    isSuccess: false,
    isError: false,
  });
  const [formData, setFormData] = useState(initialFormData);
  const [localGovernmentOptions, setLocalGovernmentOptions] = useState<string[]>([]);
  const [isLoadingLocalGovernments, setIsLoadingLocalGovernments] = useState(false);
  const [isManualLocalGovernment, setIsManualLocalGovernment] = useState(false);
  const selectedParticipationRoles = [
    formData.participationType,
    formData.wantsAdditionalRole === "yes"
      ? formData.additionalParticipationType
      : "",
  ].filter(Boolean);
  const selectedRoleContributionOptions = selectedParticipationRoles.flatMap(
    (role) => roleContributionOptions[role] ?? contributionOptions,
  );
  const availableContributionOptions = [
    ...new Set(selectedRoleContributionOptions),
  ];

  useEffect(() => {
    const countryCode = africaCountryCodes[formData.country];
    if (!countryCode) {
      return;
    }

    const controller = new AbortController();
    fetch(`https://www.geoboundaries.org/api/current/gbOpen/${countryCode}/ADM2/`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Unable to load administrative areas"))))
      .then((metadata: { gjDownloadURL?: string }) => {
        if (!metadata.gjDownloadURL) throw new Error("No administrative-area dataset found");
        return fetch(metadata.gjDownloadURL, { signal: controller.signal });
      })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Unable to load administrative areas"))))
      .then((dataset: { features?: { properties?: Record<string, unknown> }[] }) => {
        const names = (dataset.features ?? [])
          .map((feature) => feature.properties)
          .filter((properties): properties is Record<string, unknown> => Boolean(properties))
          .map((properties) => String(properties.shapeName ?? properties.name ?? properties.NAME_2 ?? "").trim())
          .filter(Boolean)
          .sort((first, second) => first.localeCompare(second));
        setLocalGovernmentOptions([...new Set(names)]);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLocalGovernmentOptions([]);
      })
      .finally(() => setIsLoadingLocalGovernments(false));

    return () => controller.abort();
  }, [formData.country]);

  function handleCountryChange(country: string) {
    setFormData({
      ...formData,
      country,
      stateRegion: "",
      localGovernmentArea: "",
    });
    setLocalGovernmentOptions([]);
    setIsLoadingLocalGovernments(Boolean(africaCountryCodes[country]));
    setIsManualLocalGovernment(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !formData.country ||
      !formData.professionalField.length ||
      !formData.contributionAreas.length ||
      !formData.wantsAdditionalRole ||
      (formData.wantsAdditionalRole === "yes" &&
        !formData.additionalParticipationType) ||
      !formData.consentContact ||
      !formData.consentStandards ||
      !formData.consentData
    ) {
      setFormState({
        isSubmitting: false,
        message:
          "Please complete the required registration fields, select at least one professional field and contribution area, and accept all required consent statements.",
        isSuccess: false,
        isError: true,
      });
      return;
    }
    setFormState({
      isSubmitting: true,
      message: "",
      isSuccess: false,
      isError: false,
    });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          organization: formData.organization.trim() || null,
          organization_address: formData.organizationAddress.trim() || null,
          phone: formData.phone.trim() || null,
          country: formData.country || null,
          state_region: formData.stateRegion || null,
          city: formData.city.trim() || null,
          local_government: formData.localGovernmentArea.trim() || null,
          professional_prefix: formData.prefix || null,
          job_title: formData.jobTitle.trim() || null,
          professional_field:
            (formData.professionalField[0] === "Prefer to Specify"
              ? formData.professionalFieldOther
              : formData.professionalField[0]) || null,
          website: formData.website.trim() || null,
          organization_website: formData.organizationWebsite.trim() || null,
          participation_type: [
            formData.participationType,
            formData.additionalParticipationType,
          ].filter(Boolean).join("; "),
          contribution_areas: [
            ...formData.contributionAreas,
            ...formData.programmeAreas,
          ],
          expertise_summary: formData.areaOfExpertise.trim() || null,
          commitment_level: formData.commitmentLevel,
          estimated_time: formData.estimatedTime,
          geographic_interest: formData.geographicInterest,
          resource_offers: formData.resourceOffers,
          additional_information: formData.additionalInformation.trim() || null,
          message: formData.message.trim() || null,
          consent_contact: formData.consentContact,
          consent_standards: formData.consentStandards,
          consent_data: formData.consentData,
          wants_updates: formData.wantsUpdates,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.error ||
            "Something went wrong. Please try again or contact us.",
        );
      }

      setFormState({
        isSubmitting: false,
        message:
          "Thank you for stepping forward. Your registration has been received. The GeoMentor Africa team will review your interests and contact you regarding relevant opportunities.",
        isSuccess: true,
        isError: false,
      });
      setFormData(initialFormData);
    } catch (error) {
      setFormState({
        isSubmitting: false,
        message:
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again.",
        isSuccess: false,
        isError: true,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-base">
      <SectionHeading title="REGISTRATION" />
      <CollapsibleSection title="BIO DATA" defaultOpen>
        <Field label="PREFIX" htmlFor="professionalPrefix">
        <select
          id="professionalPrefix"
          value={formData.prefix}
          onChange={(event) =>
            setFormData({ ...formData, prefix: event.target.value })
          }
          className={inputClass}
        >
          <option value="">Select a prefix</option>
          {professionalPrefixOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        </Field>
        <Field label="FULL NAME *" htmlFor="fullName">
        <input
          id="fullName"
          type="text"
          required
          placeholder="Your name"
          value={formData.fullName}
          onChange={(event) =>
            setFormData({ ...formData, fullName: event.target.value })
          }
          className={inputClass}
        />
        </Field>
        <Field label="EMAIL ADDRESS *" htmlFor="email">
        <input
          id="email"
          type="email"
          required
          placeholder="your@email.com"
          value={formData.email}
          onChange={(event) =>
            setFormData({ ...formData, email: event.target.value })
          }
          className={inputClass}
        />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="PHONE / WHATSAPP NUMBER" htmlFor="phone">
          <input
            id="phone"
            type="tel"
            placeholder="+234..."
            value={formData.phone}
            onChange={(event) =>
              setFormData({ ...formData, phone: event.target.value })
            }
            className={inputClass}
          />
        </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="ADDRESS">
        <Field label="COUNTRY *" htmlFor="country">
        <select
          id="country"
          required
          value={formData.country}
          onChange={(event) => handleCountryChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select your country</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        </Field>

        <Field label="STATE / PROVINCE / REGION" htmlFor="stateRegion">
        <select
          id="stateRegion"
          value={
            formData.stateRegion &&
            countryRegions[formData.country]?.includes(formData.stateRegion)
              ? formData.stateRegion
              : formData.stateRegion
                ? "Other"
                : ""
          }
          disabled={!formData.country}
          onChange={(event) =>
            setFormData({ ...formData, stateRegion: event.target.value })
          }
          className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
        >
          <option value="">
            {formData.country ? "Select your region" : "Choose a country first"}
          </option>
          {(countryRegions[formData.country] ?? []).map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
        {formData.country &&
          (!countryRegions[formData.country] ||
            formData.stateRegion === "Other" ||
            (formData.stateRegion &&
              !countryRegions[formData.country].includes(
                formData.stateRegion,
              ))) && (
            <input
              type="text"
              aria-label="Other state, province or region"
              placeholder="Enter your state, province or region"
              value={
                formData.stateRegion === "Other" ? "" : formData.stateRegion
              }
              onChange={(event) =>
                setFormData({ ...formData, stateRegion: event.target.value })
              }
              className={`${inputClass} mt-3`}
            />
          )}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="CITY" htmlFor="city">
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(event) =>
              setFormData({ ...formData, city: event.target.value })
            }
            className={inputClass}
          />
        </Field>
        <Field label="LOCAL GOVERNMENT" htmlFor="localGovernmentArea">
          <select
            id="localGovernmentArea"
            value={
              localGovernmentOptions.includes(formData.localGovernmentArea)
                ? formData.localGovernmentArea
                : formData.localGovernmentArea
                  ? "Other"
                  : ""
            }
            disabled={!formData.country || isLoadingLocalGovernments}
            onChange={(event) =>
              (() => {
                const value = event.target.value;
                setIsManualLocalGovernment(value === "Other");
                setFormData({
                  ...formData,
                  localGovernmentArea: value === "Other" ? "" : value,
                });
              })()
            }
            className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
          >
            <option value="">
              {isLoadingLocalGovernments ? "Loading local governments..." : formData.country ? "Select local government" : "Choose a country first"}
            </option>
            {localGovernmentOptions.map((localGovernment) => (
              <option key={localGovernment} value={localGovernment}>
                {localGovernment}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          {(isManualLocalGovernment ||
            (!isLoadingLocalGovernments && formData.country && localGovernmentOptions.length === 0)) && (
            <input
              type="text"
              aria-label="Other local government"
              placeholder="Enter your local government"
              value={formData.localGovernmentArea}
              onChange={(event) =>
                setFormData({ ...formData, localGovernmentArea: event.target.value })
              }
              className={`${inputClass} mt-3`}
            />
          )}
        </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="PROFESSIONAL INFO">
        <Field label="ORGANIZATION / INSTITUTION" htmlFor="organization">
        <input
          id="organization"
          type="text"
          placeholder="Name of your institution"
          value={formData.organization}
          onChange={(event) =>
            setFormData({ ...formData, organization: event.target.value })
          }
          className={inputClass}
        />
        </Field>
        <Field label="ADDRESS OF ORGANIZATION" htmlFor="organizationAddress">
        <input
          id="organizationAddress"
          type="text"
          placeholder="Address of your organization or institution"
          value={formData.organizationAddress}
          onChange={(event) =>
            setFormData({ ...formData, organizationAddress: event.target.value })
          }
          className={inputClass}
        />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="DESIGNATION (JOB TITLE / CURRENT ROLE)" htmlFor="jobTitle">
          <select
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(event) =>
              setFormData({ ...formData, jobTitle: event.target.value })
            }
            className={inputClass}
          >
            <option value="">Select your current role</option>
            {Object.entries(jobTitleGroups).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
        </div>
        <Field label="WEBSITE / LINKEDIN PROFILE (PERSONAL)" htmlFor="website">
        <input
          id="website"
          type="url"
          placeholder="https://..."
          value={formData.website}
          onChange={(event) =>
            setFormData({ ...formData, website: event.target.value })
          }
          className={inputClass}
        />
        </Field>
        <Field label="WEBSITE / LINKEDIN PROFILE (ORGANISATION)" htmlFor="organizationWebsite">
        <input
          id="organizationWebsite"
          type="url"
          placeholder="https://..."
          value={formData.organizationWebsite}
          onChange={(event) =>
            setFormData({ ...formData, organizationWebsite: event.target.value })
          }
          className={inputClass}
        />
        </Field>
        <Field label="PROFESSIONAL FIELD / AREA OF EXPERTISE *" htmlFor="professionalField">
          <select
            id="professionalField"
            required
            value={formData.professionalField[0] ?? ""}
            onChange={(event) =>
              setFormData({
                ...formData,
                professionalField: event.target.value ? [event.target.value] : [],
                professionalFieldOther: "",
              })
            }
            className={inputClass}
          >
            <option value="">Select one professional field</option>
            {professionalFieldOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select one area that best represents your professional background,
            technical expertise or area of contribution.
          </p>
        </Field>
        {formData.professionalField[0] === "Prefer to Specify" && (
          <Field label="SPECIFY PROFESSIONAL FIELD *" htmlFor="professionalFieldOther">
            <input
              id="professionalFieldOther"
              type="text"
              required
              placeholder="Enter your professional field"
              value={formData.professionalFieldOther}
              onChange={(event) =>
                setFormData({ ...formData, professionalFieldOther: event.target.value })
              }
              className={inputClass}
            />
          </Field>
        )}
        <Field label="ADDITIONAL DETAILS ON PROFESSIONAL FIELD / AREA OF EXPERTISE" htmlFor="areaOfExpertise">
          <textarea
            id="areaOfExpertise"
            rows={5}
            placeholder="Add any further details about your expertise, experience or preferred contribution."
            value={formData.areaOfExpertise}
            onChange={(event) =>
              setFormData({ ...formData, areaOfExpertise: event.target.value })
            }
            className={inputClass}
          />
        </Field>
      </CollapsibleSection>
      <Field
        label="HOW WOULD YOU LIKE TO PARTICIPATE? *"
        htmlFor="participationType"
      >
        <select
          id="participationType"
          required
          value={formData.participationType}
          onChange={(event) =>
            setFormData({ ...formData, participationType: event.target.value })
          }
          className={inputClass}
        >
          <option value="">Select one</option>
          {participationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <p className="-mt-3 text-sm leading-6 text-slate-600">
        Select your primary role.
      </p>
      <p className="-mt-3 text-sm leading-6 text-slate-600">
        A Geo-Partner may be an individual, organisation, institution, company, government agency, university, professional body, donor, foundation or development partner contributing resources, expertise, technology, funding or institutional support to GeoMentor Africa.
      </p>
      <Field label="WOULD YOU LIKE AN ADDITIONAL ROLE? *" htmlFor="wantsAdditionalRole">
        <select
          id="wantsAdditionalRole"
          required
          value={formData.wantsAdditionalRole}
          onChange={(event) =>
            setFormData({
              ...formData,
              wantsAdditionalRole: event.target.value,
              additionalParticipationType:
                event.target.value === "yes" ? formData.additionalParticipationType : "",
            })
          }
          className={inputClass}
        >
          <option value="">Select yes or no</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </Field>
      <p className="-mt-3 text-sm leading-6 text-slate-600">
        Volunteers may select one additional role based on expertise, interests,
        resources and level of commitment.
      </p>
      {formData.wantsAdditionalRole === "yes" && (
        <Field label="SELECT YOUR ADDITIONAL ROLE *" htmlFor="additionalParticipationType">
          <select
            id="additionalParticipationType"
            required
            value={formData.additionalParticipationType}
            onChange={(event) =>
              setFormData({ ...formData, additionalParticipationType: event.target.value })
            }
            className={inputClass}
          >
            <option value="">Select an additional role</option>
            {participationOptions
              .filter((option) => option !== formData.participationType)
              .map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
          </select>
        </Field>
      )}
      {availableContributionOptions.length > 0 && (
        <CheckboxGroup
          legend="HOW WOULD YOU LIKE TO CONTRIBUTE? *"
          description="Select all that apply for your selected role(s)."
          options={availableContributionOptions}
          values={formData.contributionAreas}
          onChange={(values) =>
            setFormData({ ...formData, contributionAreas: values })
          }
          required
        />
      )}
      <fieldset className="space-y-3">
        <legend className="mb-3 block text-xs font-black tracking-[.14em] text-emerald-700">
          CONSENT & COMMUNICATION *
        </legend>
        <Consent
          checked={formData.consentContact}
          onChange={(checked) =>
            setFormData({ ...formData, consentContact: checked })
          }
          required
        >
          I consent to GeoMentor Africa using the information provided to
          contact me regarding volunteering, partnerships, programmes and
          related opportunities.
        </Consent>
        <Consent
          checked={formData.consentStandards}
          onChange={(checked) =>
            setFormData({ ...formData, consentStandards: checked })
          }
          required
        >
          I understand that submitting this form does not automatically confirm
          appointment as a GeoMentor, partner or programme representative.
        </Consent>
        <Consent
          checked={formData.consentData}
          onChange={(checked) =>
            setFormData({ ...formData, consentData: checked })
          }
          required
        >
          I agree to uphold applicable safeguarding, ethical, data-protection
          and professional standards when participating in GeoMentor Africa
          activities.
        </Consent>
        <Consent
          checked={formData.wantsUpdates}
          onChange={(checked) =>
            setFormData({ ...formData, wantsUpdates: checked })
          }
        >
          I would like to receive GeoMentor Africa news, events and programme
          updates.
        </Consent>
      </fieldset>

      {formState.message && (
        <div
          className={`flex gap-3 rounded-lg border px-4 py-3 text-base ${formState.isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
          role="status"
        >
          {formState.isSuccess ? (
            <CheckCircle className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
          )}
          <span>{formState.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
      >
        {formState.isSubmitting ? (
          <>
            <Loader className="size-4 animate-spin" />
            Submitting registration...
          </>
        ) : (
          <>
            <Mail className="size-4" />
            Join GeoMentor Africa
          </>
        )}
      </button>
      <p className="text-center text-sm text-slate-500">
        We&apos;ll send you updates about our launch and early access opportunities.
        We won&apos;t share your email with anyone else.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-black tracking-[.14em] text-emerald-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="border-b border-emerald-100 pb-2 pt-4 text-sm font-black tracking-[.16em] text-emerald-800">
      {title}
    </h2>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-emerald-100 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-black tracking-[.16em] text-emerald-800 marker:hidden [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-6 border-t border-emerald-100 p-4 pt-5">
        {children}
      </div>
    </details>
  );
}

function CheckboxGroup({
  legend,
  description,
  options,
  groups,
  values,
  onChange,
  required = false,
}: {
  legend: string;
  description?: string;
  options?: readonly string[];
  groups?: readonly { label: string; options: readonly string[] }[];
  values: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const optionGroups = groups ?? [{ label: "", options: options ?? [] }];
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-black tracking-[.1em] text-emerald-700">
          {legend}
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-500">
          {values.length ? `${values.length} selected` : "Choose options"}
          <ChevronDown
            className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      )}
      {isOpen && (
        <div className="mt-4 space-y-5 border-t border-slate-200 pt-4">
          {optionGroups.map((group) => (
            <div key={group.label}>
              {group.label && <h3 className="mb-3 text-sm font-bold text-slate-800">{group.label}</h3>}
              <div className="grid gap-3 sm:grid-cols-2">
                {group.options.map((option) => (
                  <label key={option} className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={values.includes(option)}
                      required={required && values.length === 0 && option === group.options[0]}
                      onChange={(event) =>
                        onChange(event.target.checked ? [...values, option] : values.filter((value) => value !== option))
                      }
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
                    />
                    <span className="text-base leading-6 text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}

function Consent({
  checked,
  onChange,
  required = false,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
      />
      {children}
    </label>
  );
}
