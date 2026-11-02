const translations = {
  it: {
    welcome: "Benvenuto",
    myWedding: "Il Mio Matrimonio",
    rsvp: "RSVP & Famiglia",
    hotels: "Hotel",
    transfers: "Transfer",
    experiences: "Esperienze",
    services: "Servizi Extra",
    wishes: "Desideri",
    chat: "Chat",
    bookingSummary: "Riepilogo Prenotazioni",
    logout: "Esci"
  },
  en: {
    welcome: "Welcome",
    myWedding: "My Wedding",
    rsvp: "RSVP & Family",
    hotels: "Hotels",
    transfers: "Transfers",
    experiences: "Experiences",
    services: "Extra Services",
    wishes: "Wishes",
    chat: "Chat",
    bookingSummary: "Booking Summary",
    logout: "Logout"
  }
};

export const t = (lang: 'it' | 'en', key: keyof typeof translations.it) => translations[lang][key] || key;
