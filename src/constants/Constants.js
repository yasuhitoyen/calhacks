// Service options reflecting attribute-based filters rather than service categories
// Each option corresponds to one of the six boolean columns in the dataset.
// Icons are chosen for quick visual recognition in the UI.

const availableServices = [
  {
    id: 1,
    name: "Downtown Food Bank",
    type: "food",
    distance: "0.5 miles",
    rating: 4.5,
    isOpen: true,
    address: "123 Main St",
    phone: "(555) 123-4567",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: 2,
    name: "Community Health Center",
    type: "healthcare",
    distance: "0.8 miles",
    rating: 4.2,
    isOpen: true,
    address: "456 Oak Ave",
    phone: "(555) 234-5678",
    lat: 37.7849,
    lng: -122.4094
  },
  {
    id: 3,
    name: "Legal Aid Society",
    type: "legal",
    distance: "1.2 miles",
    rating: 4.7,
    isOpen: false,
    address: "789 Pine St",
    phone: "(555) 345-6789",
    lat: 37.7649,
    lng: -122.4294
  },
  {
    id: 4,
    name: "Homeless Shelter",
    type: "housing",
    distance: "0.3 miles",
    rating: 4.1,
    isOpen: true,
    address: "321 Elm St",
    phone: "(555) 456-7890",
    lat: 37.7549,
    lng: -122.4394
  }
];

const serviceOptions = [
  {
    id: 'requires_id',
    label: 'Requires ID',
    icon: '🪪', // identification card
    description: 'Government or photo ID required',
  },
  {
    id: 'wheelchair_access',
    label: 'Wheelchair Accessible',
    icon: '♿️',
    description: 'Facilities accessible to wheelchair users',
  },
  {
    id: 'women_only',
    label: 'Women Only',
    icon: '🚺',
    description: 'Services exclusive to women',
  },
  {
    id: 'lgbtq_friendly',
    label: 'LGBTQ+ Friendly',
    icon: '🏳️‍🌈',
    description: 'Safe and supportive environment for LGBTQ+ individuals',
  },
  {
    id: 'walkins_welcome',
    label: 'Walk‑ins Welcome',
    icon: '🚶',
    description: 'No appointment necessary; walk‑ins accepted',
  },
  {
    id: 'multilingual_staff',
    label: 'Multilingual Staff',
    icon: '🗣️',
    description: 'Staff available who speak multiple languages',
  },
];

export { serviceOptions, availableServices };
