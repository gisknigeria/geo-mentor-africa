"use client";

import { FormEvent, type ReactNode, useState } from "react";
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

const countries = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Democratic Republic of the Congo",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "The Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Ivory Coast",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Republic of the Congo",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
  "Other",
];
const participationOptions = [
  "GeoMentor / Professional Volunteer",
  "Expert / Researcher / Academic",
  "Teacher / Educator",
  "Student / Young Professional",
  "School / Educational Institution",
  "Conservation Organisation / NGO",
  "University / Research Institution",
  "Technology Partner",
  "Corporate / Industry Partner",
  "Sponsor / Funding Partner",
  "Government / Public Institution",
  "Community Organisation",
  "Other",
];
const professionalFieldOptions = [
  "Geospatial Science / GIS",
  "Surveying / Mapping",
  "Remote Sensing",
  "Data Science / Analytics",
  "Artificial Intelligence / Machine Learning",
  "Software Engineering / Technology",
  "Environmental Science",
  "Ecology / Biodiversity",
  "Conservation",
  "Forestry / Agriculture",
  "Climate Science",
  "Education / Teaching",
  "Research / Academia",
  "Community Development",
  "Project Management",
  "Policy / Government",
  "Business / Entrepreneurship",
  "Communications / Media",
  "Finance / Fundraising",
  "Other",
];
const contributionOptions = [
  "Mentorship & Education",
  "Training & Knowledge Sharing",
  "School Adoption & Support",
  "Biodiversity Monitoring & Field Data",
  "Indigenous Tree Restoration & School Greening",
  "Conservation Planning & Field Projects",
  "Research & Scientific Collaboration",
  "Expert Validation & Technical Review",
  "Environmental Data & Analytics",
  "GIS, Mapping & Remote Sensing",
  "AI, Software & Digital Platforms",
  "GeoIoT, Sensors & Electronics",
  "Cloud, Data Infrastructure & Cybersecurity",
  "Green Enterprise & Entrepreneurship",
  "Market & Value-Chain Development",
  "Financial Literacy & Enterprise Mentoring",
  "Partnerships & Institutional Collaboration",
  "Funding, Sponsorship & Resource Mobilisation",
  "Policy & Government Engagement",
  "Programme Development, Monitoring & Evaluation",
  "Advocacy & Public Engagement",
  "Media, Communications & Storytelling",
  "Volunteer Coordination & Programme Support",
  "Other Contribution",
];
const programmeOptions = [
  "Geo-Mentoring",
  "School Adoption",
  "Biodiversity Conservation",
  "Indigenous Tree Restoration",
  "GIS & Mapping",
  "Citizen Science",
  "Climate & Environmental Monitoring",
  "GeoIoT",
  "Artificial Intelligence",
  "Research & Data",
  "Agriculture & Agrobiodiversity",
  "Green Entrepreneurship",
  "Youth Development",
  "Training & Capacity Building",
  "Conservation Finance",
  "Partnerships & Funding",
  "Policy & Institutional Development",
];
const commitmentOptions = [
  "One-time volunteer activity",
  "Occasional volunteer",
  "Monthly contributor",
  "Regular GeoMentor",
  "Project-based contributor",
  "Institutional partner",
  "Funding / resource partner",
  "Research collaborator",
  "Long-term strategic partner",
  "Not sure yet — I would like to discuss opportunities",
];
const timeOptions = [
  "1–2 hours per month",
  "3–5 hours per month",
  "6–10 hours per month",
  "More than 10 hours per month",
  "Project dependent",
  "Institutional / resource contribution rather than time",
];
const geographicOptions = [
  "Within my local community",
  "Within my state / region",
  "Within my country",
  "Across Africa",
  "Online / remotely",
  "Any location where support is needed",
];
const resourceOptions = [
  "Professional expertise",
  "Training",
  "Research support",
  "Software / technology",
  "Equipment",
  "Seedlings / planting materials",
  "Scholarships",
  "Grants / funding",
  "Venue / facilities",
  "Media support",
  "Market access",
  "Institutional connections",
  "Volunteer network",
  "Other",
];
const interestOptions = [
  ["mentorship", "Mentorship & guidance for students"],
  ["fieldCapture", "Field data capture & biodiversity tracking"],
  ["partnershipFunding", "Partnership opportunities & funding"],
  ["research", "Research & data access"],
] as const;

const initialFormData = {
  fullName: "",
  email: "",
  organization: "",
  phone: "",
  city: "",
  jobTitle: "",
  professionalField: "",
  website: "",
  country: "",
  stateRegion: "",
  message: "",
  participationType: "",
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !formData.country ||
      !formData.contributionAreas.length ||
      !formData.consentContact ||
      !formData.consentStandards ||
      !formData.consentData
    ) {
      setFormState({
        isSubmitting: false,
        message:
          "Please choose a country, select at least one contribution area, and accept all required consent statements.",
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
          phone: formData.phone.trim() || null,
          country: formData.country || null,
          state_region: formData.stateRegion || null,
          city: formData.city.trim() || null,
          job_title: formData.jobTitle.trim() || null,
          professional_field: formData.professionalField.trim() || null,
          website: formData.website.trim() || null,
          participation_type: formData.participationType,
          contribution_areas: [
            ...formData.contributionAreas,
            ...formData.programmeAreas,
          ],
          expertise_summary: formData.message.trim(),
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
        <Field label="CITY / LOCATION" htmlFor="city">
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
      </div>
      <Field label="SCHOOL / ORGANIZATION" htmlFor="organization">
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

      <Field label="COUNTRY / REGION *" htmlFor="country">
        <select
          id="country"
          required
          value={formData.country}
          onChange={(event) =>
            setFormData({
              ...formData,
              country: event.target.value,
              stateRegion: "",
            })
          }
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
        <Field label="JOB TITLE / ROLE" htmlFor="jobTitle">
          <input
            id="jobTitle"
            type="text"
            value={formData.jobTitle}
            onChange={(event) =>
              setFormData({ ...formData, jobTitle: event.target.value })
            }
            className={inputClass}
          />
        </Field>
        <Field
          label="PROFESSIONAL FIELD / AREA OF EXPERTISE"
          htmlFor="professionalField"
        >
          <select
            id="professionalField"
            value={
              professionalFieldOptions.includes(formData.professionalField)
                ? formData.professionalField
                : formData.professionalField
                  ? "Other"
                  : ""
            }
            onChange={(event) =>
              setFormData({
                ...formData,
                professionalField: event.target.value,
              })
            }
            className={inputClass}
          >
            <option value="">Select your field</option>
            {professionalFieldOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {formData.professionalField === "Other" ||
          (formData.professionalField &&
            !professionalFieldOptions.includes(formData.professionalField)) ? (
            <input
              type="text"
              aria-label="Other professional field or area of expertise"
              placeholder="Enter your professional field"
              value={
                formData.professionalField === "Other"
                  ? ""
                  : formData.professionalField
              }
              onChange={(event) =>
                setFormData({
                  ...formData,
                  professionalField: event.target.value,
                })
              }
              className={`${inputClass} mt-3`}
            />
          ) : null}
        </Field>
      </div>
      <Field label="WEBSITE / LINKEDIN PROFILE (OPTIONAL)" htmlFor="website">
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
      <CheckboxGroup
        legend="HOW WOULD YOU LIKE TO CONTRIBUTE? *"
        options={contributionOptions}
        values={formData.contributionAreas}
        onChange={(values) =>
          setFormData({ ...formData, contributionAreas: values })
        }
        required
      />
      <Field
        label="WHAT CAN YOU BRING TO GEOMENTOR AFRICA? *"
        htmlFor="message"
      >
        <textarea
          id="message"
          required
          placeholder="Describe your experience, expertise, resources, network or contribution..."
          value={formData.message}
          onChange={(event) =>
            setFormData({ ...formData, message: event.target.value })
          }
          rows={4}
          className={inputClass}
        />
      </Field>
      <CheckboxGroup
        legend="AREAS OF INTEREST"
        options={programmeOptions}
        values={formData.programmeAreas}
        onChange={(values) =>
          setFormData({ ...formData, programmeAreas: values })
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="LEVEL OF COMMITMENT *" htmlFor="commitmentLevel">
          <select
            id="commitmentLevel"
            required
            value={formData.commitmentLevel}
            onChange={(event) =>
              setFormData({ ...formData, commitmentLevel: event.target.value })
            }
            className={inputClass}
          >
            <option value="">Select one</option>
            {commitmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ESTIMATED TIME" htmlFor="estimatedTime">
          <select
            id="estimatedTime"
            value={formData.estimatedTime}
            onChange={(event) =>
              setFormData({ ...formData, estimatedTime: event.target.value })
            }
            className={inputClass}
          >
            <option value="">Select one</option>
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="GEOGRAPHIC INTEREST" htmlFor="geographicInterest">
        <select
          id="geographicInterest"
          value={formData.geographicInterest}
          onChange={(event) =>
            setFormData({ ...formData, geographicInterest: event.target.value })
          }
          className={inputClass}
        >
          <option value="">Select one</option>
          {geographicOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <CheckboxGroup
        legend="PARTNERSHIP OR RESOURCE OFFER"
        options={resourceOptions}
        values={formData.resourceOffers}
        onChange={(values) =>
          setFormData({ ...formData, resourceOffers: values })
        }
      />
      <Field
        label="ADDITIONAL INFORMATION (OPTIONAL)"
        htmlFor="additionalInformation"
      >
        <textarea
          id="additionalInformation"
          value={formData.additionalInformation}
          onChange={(event) =>
            setFormData({
              ...formData,
              additionalInformation: event.target.value,
            })
          }
          rows={3}
          className={inputClass}
        />
      </Field>

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
        We'll send you updates about our launch and early access opportunities.
        We won't share your email with anyone else.
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

function CheckboxGroup({
  legend,
  options,
  values,
  onChange,
  required = false,
}: {
  legend: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
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
      {isOpen && (
        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-start gap-3"
            >
              <input
                type="checkbox"
                checked={values.includes(option)}
                required={
                  required && values.length === 0 && option === options[0]
                }
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...values, option]
                      : values.filter((value) => value !== option),
                  )
                }
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
              />
              <span className="text-base leading-6 text-slate-700">
                {option}
              </span>
            </label>
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
