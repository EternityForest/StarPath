import { ref } from 'vue'


function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
const targetSettings = ref({
    // Date and time as ISO
    "time": formatDate(new Date()),
    "name": "John Smith",
    location: "",
    lat: 0,
    lon: 0,

   //Use the transit/synastry mode
    "transit": false,
    "time2": formatDate(new Date()),
    "name2": "",

    location2: "",
    lat2: 0,
    lon2: 0
})

const interpretSettings = ref({
    "zodiac": "sidereal",
    "houses": "placidus",
    "fixed_stars":["Polaris"]
})

export{
    targetSettings,
    interpretSettings
}