export const translations = {
  en: {
    // Navigation
    home: "Home",
    discover: "Discover", 
    map: "Map",
    // Common
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    error: "Error",
    // Discover page
    findResources: "Find Resources",
    searchResources: "Search resources...",
    aiSearch: "AI",
    showLocalOnly: "Show Local Only",
    showSavesOnly: "Show Saves Only",
    noResourcesFound: "No resources found",
    tryDifferentSearch: "Try a different search or adjust filters",
    // Map page
    mapView: "Map View",
    heatmap: "Heatmap",
    localResources: "Local Resources",
    // Categories
    categories: {
      "Housing": "Housing",
      "Food": "Food",
      "Food Assistance": "Food Assistance", 
      "Healthcare": "Healthcare",
      "Employment": "Employment",
      "Education": "Education",
      "Transportation": "Transportation",
      "Mental Health": "Mental Health",
      "Legal Aid": "Legal Aid"
    },
    // Location
    locationPermission: "Enable location services to see local resources",
    locationDenied: "Location access denied. Please enable location services to see local resources.",
    enterZipCode: "Enter ZIP code",
    useLocation: "Use My Location",
    useZipCode: "Use ZIP Code",
    // Saves
    saves: "Saves",
    noSaves: "No saved resources",
    saveResource: "Save Resource",
    removeSave: "Remove Save",
    // Resource details
    phone: "Phone",
    website: "Website",
    address: "Address",
    hours: "Hours",
    distance: "Distance",
    // AI
    aiRecommendations: "AI Recommendations",
    aiSearching: "AI is searching for you...",
    hideRecommendations: "Hide Recommendations"
  },
  es: {
    // Navigation
    home: "Inicio",
    discover: "Descubrir",
    map: "Mapa",
    // Common
    search: "Buscar",
    filter: "Filtrar",
    loading: "Cargando...",
    error: "Error",
    // Discover page
    findResources: "Encontrar Recursos",
    searchResources: "Buscar recursos...",
    aiSearch: "IA",
    showLocalOnly: "Mostrar Solo Locales",
    showSavesOnly: "Mostrar Solo Guardados",
    noResourcesFound: "No se encontraron recursos",
    tryDifferentSearch: "Intenta una búsqueda diferente o ajusta los filtros",
    // Map page
    mapView: "Vista del Mapa",
    heatmap: "Mapa de Calor",
    localResources: "Recursos Locales",
    // Categories
    categories: {
      "Housing": "Vivienda",
      "Food": "Alimentos",
      "Food Assistance": "Asistencia Alimentaria",
      "Healthcare": "Atención Médica",
      "Employment": "Empleo",
      "Education": "Educación",
      "Transportation": "Transporte",
      "Mental Health": "Salud Mental",
      "Legal Aid": "Ayuda Legal"
    },
    // Location
    locationPermission: "Habilita los servicios de ubicación para ver recursos locales",
    locationDenied: "Acceso a la ubicación denegado. Por favor, habilita los servicios de ubicación para ver recursos locales.",
    enterZipCode: "Ingresa código postal",
    useLocation: "Usar Mi Ubicación",
    useZipCode: "Usar Código Postal",
    // Saves
    saves: "Guardados",
    noSaves: "No hay recursos guardados",
    saveResource: "Guardar Recurso",
    removeSave: "Quitar Guardado",
    // Resource details
    phone: "Teléfono",
    website: "Sitio Web",
    address: "Dirección",
    hours: "Horas",
    distance: "Distancia",
    // AI
    aiRecommendations: "Recomendaciones de IA",
    aiSearching: "La IA está buscando por ti...",
    hideRecommendations: "Ocultar Recomendaciones"
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
