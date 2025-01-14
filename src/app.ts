import { ref, type Ref, watch } from "vue";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const targetSettings = ref({
  // Date and time as ISO
  time: formatDate(new Date()),
  name: "John Smith",
  location: "",
  lat: 0,
  lon: 0,

  //Use the transit/synastry mode
  transit: false,
  time2: formatDate(new Date()),
  name2: "",

  location2: "",
  lat2: 0,
  lon2: 0,
});

const interpretSettings = ref({
  zodiac: "sidereal",
  houses: "placidus",
  fixed_stars: ["Polaris"],
});

// These don't gtremoved by the system automatically
const manuallyAddedFixedStars: Ref<{ [key: string]: boolean }> = ref({"Polaris": true});

const sharingUrl = ref(window.location.href);

function settingsToUrl(targetSettings: any, interpretSettings: any) {
  // Get current url without any params
  let url = new URL(window.location.href.split("?")[0]);
  url.searchParams.set("time", targetSettings.time);
  url.searchParams.set("name", targetSettings.name);
  url.searchParams.set("location", targetSettings.location);
  url.searchParams.set("lat", targetSettings.lat);
  url.searchParams.set("lon", targetSettings.lon);
  url.searchParams.set("transit", targetSettings.transit);
  url.searchParams.set("time2", targetSettings.time2);
  url.searchParams.set("name2", targetSettings.name2);
  url.searchParams.set("location2", targetSettings.location2);
  url.searchParams.set("lat2", targetSettings.lat2);
  url.searchParams.set("lon2", targetSettings.lon2);

  url.searchParams.set("zodiac", interpretSettings.zodiac);
  url.searchParams.set("houses", interpretSettings.houses);
  url.searchParams.set("fixed_stars", interpretSettings.fixed_stars.join(","));
  window.history.replaceState(null, "Astria", url.href);
  sharingUrl.value = url.href;
}

function urlToSettings(url: URL) {
  if (url.searchParams.get("time")) {
    targetSettings.value.time =
      url.searchParams.get("time") || formatDate(new Date());

    targetSettings.value.name = url.searchParams.get("name") || "";
    targetSettings.value.location = url.searchParams.get("location") || "";
    targetSettings.value.lat =
      parseFloat(url.searchParams.get("lat") || "0") || 0;
    targetSettings.value.lon =
      parseFloat(url.searchParams.get("lon") || "0") || 0;
    targetSettings.value.transit = url.searchParams.get("transit") == "true";
    if (url.searchParams.get("time2")) {
      targetSettings.value.time2 =
        url.searchParams.get("time2") || formatDate(new Date());
    }
    targetSettings.value.name2 = url.searchParams.get("name2") || "";
    targetSettings.value.location2 = url.searchParams.get("location2") || "";
    targetSettings.value.lat2 = parseFloat(url.searchParams.get("lat2") || "0");
    targetSettings.value.lon2 = parseFloat(url.searchParams.get("lon2") || "0");
  }
  if (url.searchParams.get("zodiac")) {
    interpretSettings.value.zodiac =
      url.searchParams.get("zodiac") || "tropical";
    interpretSettings.value.houses =
      url.searchParams.get("houses") || "placidus";
    interpretSettings.value.fixed_stars = (
      url.searchParams.get("fixed_stars") || ""
    ).split(",");
  }
}

urlToSettings(new URL(window.location.href));
watch(targetSettings.value, () => {
  console.log("targetSettings changed");
  settingsToUrl(targetSettings.value, interpretSettings.value);
});
watch(interpretSettings.value, () => {
  settingsToUrl(targetSettings.value, interpretSettings.value);
});

export {
  targetSettings,
  interpretSettings,
  sharingUrl,
  manuallyAddedFixedStars,
};
