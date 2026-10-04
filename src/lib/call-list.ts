export type CallGroup = "week" | "domain" | "phone"

export type CallProspect = {
  id: string
  name: string
  category: string
  phone: string
  address: string
  website: string
  group: CallGroup
  saw: string
  fix: string
  opener: string
}

export const callCheckedOn = "October 2, 2026"

export const callProspects: CallProspect[] = [
  {
    id: "amelie",
    name: "Amelie Aesthetics Studio",
    category: "Med spa",
    phone: "(337) 856-7995",
    address: "205 Prescott Boulevard #103, Youngsville, LA 70592",
    website: "http://www.amelieaesthetics.com",
    group: "week",
    saw: "The site is still plain http. The browser tab title is only “Amelie.” The mobile viewport tag sets initial-scale and leaves out width=device-width. Under the address, a Squarespace block still reads “Your Custom Text Here.” The number 337.856.7995 is text, not a phone link. The city directory lists 201 Prescott Blvd.; the site says 205.",
    fix: "Replace the placeholder, make the number a tel link, turn on HTTPS, and set the viewport to width=device-width. Put hours and a booking button on that same screen, and use one street number.",
    opener:
      "I was on amelieaesthetics.com on my phone. Under the Prescott Boulevard address it still says “Your Custom Text Here,” and the number doesn’t dial when you tap it.",
  },
  {
    id: "jelliot",
    name: "J. Elliot Salon",
    category: "Salon",
    phone: "(337) 451-6800",
    address: "509 Shore Drive, Youngsville, LA 70592",
    website: "https://www.jelliotsalon.com",
    group: "week",
    saw: "The public site is one page titled “J. Elliot Salon is under maintenance.” The only sentence is “Website under construction. Be back soon!” There is no phone, no hours, and no booking.",
    fix: "Take the holding page down. A single page with services, hours, a tap-to-call button, and a booking link is enough for someone searching tonight.",
    opener:
      "I opened jelliotsalon.com. It says the site is under construction and doesn’t list a number or your hours on Shore Drive.",
  },
  {
    id: "dutil",
    name: "Dutil Family Dentistry",
    category: "Dentist",
    phone: "(337) 856-1111",
    address: "2814 Bonin Rd., Youngsville, LA 70592",
    website: "http://www.dutildds.com/",
    group: "week",
    saw: "The City of Youngsville directory sends people to dutildds.com. That page’s only visible word is “dutildds.com.” It is not HTTPS, it has no mobile viewport, and it has no phone. The practice’s current site, dutilfamilydentistry.com, is a separate address.",
    fix: "Point dutildds.com at the current site, or change the directory listing. Anyone who types the old domain never reaches the office.",
    opener:
      "The city directory still lists dutildds.com. That page doesn’t show your hours or a way to call the Bonin Road office.",
  },
  {
    id: "cypress",
    name: "Cypress Health and Wellness",
    category: "Clinic",
    phone: "(337) 450-3047",
    address: "327 Iberia St., Suite 3A, Youngsville, LA 70592",
    website: "https://www.cypresshealthclinic.com",
    group: "week",
    saw: "The clinic number 337.450.3047 is on the homepage as styled text inside a paragraph. It is not a tel link, so a phone tap does not start a call. A second number, 337.450.3050, is the same way.",
    fix: "Wrap both numbers in tel links and put the one patients should call in the header, next to hours.",
    opener:
      "I tried cypresshealthclinic.com on a phone. The number 337.450.3047 is on the page, and tapping it doesn’t dial.",
  },
  {
    id: "burbank",
    name: "Burbank Family Dental",
    category: "Dentist",
    phone: "(337) 451-4636",
    address: "107 Centre Sarcelle Boulevard, Suite 705, Youngsville, LA 70592",
    website: "https://www.youngsvilledental.com/",
    group: "week",
    saw: "The homepage and the contact page both print (337) 451-4636, and neither copy is a phone link. Hours (Monday and Wednesday 7:00–3:30, Tuesday and Thursday 8:00–4:30, Friday 7:00–12:00) are only on the contact page. The homepage never states them.",
    fix: "Make every instance of the number a tel link, and put today’s hours in the header so a patient doesn’t have to hunt.",
    opener:
      "On youngsvilledental.com the number (337) 451-4636 isn’t tappable, and the hours only show up after you open Contact.",
  },
  {
    id: "coastal",
    name: "Coastal Climate Control & Mini Storage",
    category: "HVAC",
    phone: "(337) 857-6003",
    address: "2755 E. Milton Ave., Youngsville, LA 70592",
    website: "http://www.coastalclimatecontrol.net",
    group: "domain",
    saw: "The domain on the city directory, coastalclimatecontrol.net, no longer shows an HVAC company. It redirects to an unrelated site.",
    fix: "Confirm you still control that domain. If you do, point it at a one-page site with the Milton Avenue address, hours, and a tap-to-call button. If you don’t, publish a new address and update the directory.",
    opener:
      "The website listed for Coastal Climate Control on the Youngsville directory doesn’t show your company anymore.",
  },
  {
    id: "happypets",
    name: "Happy Pets Hotel",
    category: "Boarding",
    phone: "(337) 856-2070",
    address: "214 Burley Rd., Youngsville, LA 70592",
    website: "http://www.happypetshotel.net",
    group: "domain",
    saw: "happypetshotel.net redirects to an unrelated site. A pet owner following the directory link never sees Burley Road or a phone number for the hotel.",
    fix: "Reclaim the domain or replace the directory link with a page that shows boarding hours and a tap-to-call number.",
    opener:
      "happypetshotel.net, the site on the city directory, doesn’t open Happy Pets Hotel.",
  },
  {
    id: "homefree",
    name: "HomeFree LLC",
    category: "Home services",
    phone: "(337) 577-2030",
    address: "P.O. Box 51, Youngsville, LA 70592",
    website: "http://www.homefreellc.com",
    group: "domain",
    saw: "homefreellc.com resolves, and the page that loads is an unrelated business. There is no Youngsville address and no local phone number.",
    fix: "If you still own the domain, replace that page. If you don’t, stop listing it and put up a one-page site you control.",
    opener:
      "homefreellc.com, the address on the Youngsville directory, doesn’t show HomeFree.",
  },
  {
    id: "aromatic",
    name: "Aromatic Infusions",
    category: "Shop",
    phone: "(337) 573-7024",
    address: "514 Lafayette St., Youngsville, LA 70592",
    website: "http://www.aromaticinfusions.com",
    group: "domain",
    saw: "The domain immediately sends the browser to /lander. That page has no title and no shop content: no address, no hours, no phone.",
    fix: "Put the shop back on the domain. One screen with what you sell, Lafayette Street, hours, and a tel link.",
    opener:
      "aromaticinfusions.com opens a blank page. I couldn’t tell you’re on Lafayette Street.",
  },
  {
    id: "gracie",
    name: "Gracie Jiujitsu Youngsville",
    category: "Gym",
    phone: "(337) 573-7200",
    address: "501B Church St., Youngsville, LA 70592",
    website: "http://www.gracieyoungsville.com",
    group: "domain",
    saw: "gracieyoungsville.com sends visitors to an empty /lander. There is no class schedule and no phone number.",
    fix: "Replace the lander with the Church Street address, class times, and a way to start a trial.",
    opener:
      "gracieyoungsville.com doesn’t show a schedule or a number for the Church Street gym.",
  },
  {
    id: "meche",
    name: "Rickey Meche’s Donut King",
    category: "Bakery",
    phone: "(337) 856-5151",
    address: "101 Sabal Palms Row, Youngsville, LA 70592",
    website: "http://www.rickeymechesdonuts.com",
    group: "domain",
    saw: "The domain redirects to a noindex directory page on a builder subdomain. That page lists other shops and does not mention 101 Sabal Palms Row or a phone number. The connection is still http.",
    fix: "Give the Youngsville shop its own page: today’s hours, the Sabal Palms address, and a tap-to-call button, on HTTPS.",
    opener:
      "rickeymechesdonuts.com never mentions the Youngsville shop on Sabal Palms.",
  },
  {
    id: "carwash",
    name: "Cajun Car Wash",
    category: "Car wash",
    phone: "(337) 298-6146",
    address: "510 Lafayette St., Youngsville, LA 70592",
    website: "http://www.cajuncarwash.com",
    group: "domain",
    saw: "cajuncarwash.com returns a 404. The domain still resolves, and the page does not.",
    fix: "Restore a page with hours, wash prices, and the Lafayette Street address, or remove the dead URL from the directory.",
    opener:
      "cajuncarwash.com, the site on the city directory, comes back as page not found.",
  },
  {
    id: "cabinets",
    name: "Cabinets Plus",
    category: "Cabinets",
    phone: "(337) 856-7806",
    address: "202 Brahman Dr., Youngsville, LA 70592",
    website: "http://www.cabinetsplusllc.com",
    group: "domain",
    saw: "cabinetsplusllc.com does not resolve. The hostname on the city directory has no DNS record.",
    fix: "Register or reconnect the domain, then publish a page with the Brahman Drive address and a tap-to-call number.",
    opener:
      "The website listed for Cabinets Plus, cabinetsplusllc.com, doesn’t resolve.",
  },
  {
    id: "pediatrics",
    name: "Youngsville Pediatrics",
    category: "Clinic",
    phone: "(337) 857-5096",
    address: "814 Fortune Rd., Suite 108, Youngsville, LA 70592",
    website: "http://www.youngsvillepediatrics.com",
    group: "domain",
    saw: "youngsvillepediatrics.com does not resolve. A parent who types that address gets no office, no hours, and no number.",
    fix: "Put the practice on a domain that loads, with hours, the Fortune Road suite, and a tel link. Update the city directory to that address.",
    opener:
      "youngsvillepediatrics.com doesn’t load. Parents following the city directory never reach the Fortune Road office.",
  },
  {
    id: "ytg",
    name: "Years to Grow Daycare",
    category: "Child care",
    phone: "(337) 856-7336",
    address: "1206 Fortune Rd., Youngsville, LA 70592",
    website: "http://www.ytgdaycare.com",
    group: "domain",
    saw: "ytgdaycare.com does not resolve. The directory link is a dead hostname.",
    fix: "Publish a page a parent can open: ages you take, hours, the Fortune Road address, and a tap-to-call number.",
    opener:
      "ytgdaycare.com, the site listed for Years to Grow, doesn’t resolve.",
  },
  {
    id: "southcrown",
    name: "South Crown Customs",
    category: "Auto",
    phone: "(337) 524-3158",
    address: "113 Bluegrass Creek, Youngsville, LA 70592",
    website: "https://www.southcrownautomotive.com",
    group: "domain",
    saw: "southcrownautomotive.com does not resolve. The shop has no site at the address the city publishes.",
    fix: "Stand up one page with what you work on, hours, Bluegrass Creek, and a tel link.",
    opener:
      "southcrownautomotive.com doesn’t resolve, so the directory listing for South Crown has nowhere to go.",
  },
  {
    id: "bandj",
    name: "B&J’s Roadside Assistance",
    category: "Roadside",
    phone: "(337) 256-1882",
    address: "102 Dusty Canyon Drive, Youngsville, LA 70592",
    website: "https://www.Bandjsroadsideassistancellc.godaddysite.com",
    group: "domain",
    saw: "The GoDaddy site address on the city directory does not resolve. Someone with a dead battery cannot open the page the directory names.",
    fix: "Publish a normal domain with the phone in the header. Roadside work is a tap-to-call business.",
    opener:
      "The website on the Youngsville directory for B&J’s Roadside doesn’t load.",
  },
  {
    id: "corner",
    name: "Corner Seafood & Wings",
    category: "Restaurant",
    phone: "(337) 857-5078",
    address: "107 Centre Sarcelle Blvd., Suite 710, Youngsville, LA 70592",
    website: "https://www.cornerseafoodandwings.com/",
    group: "phone",
    saw: "The hours data on the page closes Sunday at 5:58pm and Tuesday through Saturday at 7:58pm. Monday is missing from that list. The phone number is stored as “+ +13378575078”, with a stray plus, and it is not a normal tel link.",
    fix: "Publish hours a person can trust, including Monday, on the hour you actually close. Put (337) 857-5078 in the header as a tel link.",
    opener:
      "On your site the published close times are 5:58 and 7:58, Monday isn’t listed, and the phone number is stored in a form a phone won’t dial cleanly.",
  },
  {
    id: "mandez",
    name: "Mandez’s Seafood Bar & Grill",
    category: "Restaurant",
    phone: "(337) 573-4219",
    address: "1821 Chemin Metairie Pkwy., Suite 3, Youngsville, LA 70592",
    website: "https://www.mandezsgrill.com/",
    group: "phone",
    saw: "The homepage has menus and no Youngsville phone number. The contact page shows (337) 573-4219 as text, not a tel link. A Lafayette number sits on the same page.",
    fix: "Put the Youngsville number in the header of the Youngsville pages as a tel link, next to that shop’s hours.",
    opener:
      "I was on mandezsgrill.com looking for the Youngsville shop. The Chemin Metairie number isn’t on the homepage, and on Contact it doesn’t dial when you tap it.",
  },
  {
    id: "chien",
    name: "Salon de Chien",
    category: "Pet grooming",
    phone: "(337) 856-0441",
    address: "110 Young St., Youngsville, LA 70592",
    website: "http://salondechien.com/",
    group: "phone",
    saw: "The whole site is still http. The contact page says to call in advance because space is limited, then prints 337.856.0441 as text. It is not a tel link. A fax number is stacked under it the same way.",
    fix: "Move the site to HTTPS and make the grooming number a tel link beside the hours.",
    opener:
      "salondechien.com tells people to call ahead, and the number 337.856.0441 isn’t tappable. The site is also still http.",
  },
  {
    id: "piano",
    name: "First Octave Piano Studio",
    category: "Lessons",
    phone: "(337) 794-9517",
    address: "2806 E. Milton Ave., Suite 100, Youngsville, LA 70592",
    website: "https://firstoctavepiano.com/",
    group: "phone",
    saw: "The homepage lists office hours and no phone number. The contact page is titled “Anderson’s Piano Studio,” and 337-794-9517 is colored text, not a tel link.",
    fix: "Title the contact page First Octave Piano Studio, and make the number a tel link on both the homepage and the contact page.",
    opener:
      "Your contact page is titled Anderson’s Piano Studio, and the number isn’t a link. Someone looking for First Octave has to guess.",
  },
  {
    id: "granite",
    name: "Gallery of Granite",
    category: "Showroom",
    phone: "(337) 451-6561",
    address: "106 Guernsey Lane, Youngsville, LA 70592",
    website: "https://www.galleryofgranite.com",
    group: "phone",
    saw: "The phone number is a real tel link, and the showroom content is there. The page source has no title tag, so the tab and Google have nothing to show for the page.",
    fix: "Put a title on the homepage: Gallery of Granite | Stone and tile in Youngsville, LA. Keep the phone link in the header.",
    opener:
      "galleryofgranite.com has the showroom and a working phone link, and the page itself has no title, so search results have to guess what you are.",
  },
]

export const lookedFine = [
  "Blue Apache Mexican Restaurant",
  "Simon Orthodontics",
  "Geaux Glow",
  "CC’s Coffee House, Youngsville",
  "KK’s Cafe",
  "Hargrave’s Plumbing (hargravesplumbing.com)",
  "Youngsville Dental Care",
  "Maison Dental Studio",
  "The Cottage House Salon",
]

export function preferredCallFilter(groups: readonly CallGroup[]): CallGroup | "all" {
  const order: CallGroup[] = ["week", "phone", "domain"]
  return order.find((group) => groups.includes(group)) ?? "all"
}

export const groupLabels: Record<CallGroup, string> = {
  week: "Call this week",
  domain: "The directory link doesn’t reach them",
  phone: "The site is up. The phone path is broken.",
}
