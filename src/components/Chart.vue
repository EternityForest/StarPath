<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import { Chart } from "@astrodraw/astrochart";
import { Origin, Horoscope } from "circular-natal-horoscope-js";
import { targetSettings, interpretSettings } from "../app";
import { getForDate, fixedStarNames } from "../fixedstars";

// defineProps<{ msg: string }>()

//const count = ref(0)

const positionsKey = ref({});
const positionsKey2 = ref({});

const signs_en: string[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

function nthNumber(number: number): string {
  if (number > 3 && number < 21) return "th";
  switch (number % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

//Use astrodraw's crazy data format
// Returns object where vals are sign, house, degree, minute
function computePositionsKey(
  planets: { [key: string]: number[] },
  cusps: number[]
): { [key: string]: [string, number, number, number] } {
  let result: { [key: string]: [string, number, number, number] } = {};

  for (const [key, value] of Object.entries(planets)) {
    let house: number = 12;

    let ecliptic = value[0];
    let sign = Math.floor(ecliptic / 30);
    for (const [housenum, cusp] of Object.entries(cusps)) {
      if (ecliptic > cusp) {
        house = parseInt(housenum);
      }
    }

    let deg = Math.round(ecliptic - 30 * sign);
    let minutes = Math.round((ecliptic - 30 * sign - deg) * 60);
    result[key] = [signs_en[sign], house, deg, minutes];
  }
  return result;
}

// function tropicalToSiderealOffset(parsed: Date): number {
 
//     const origin = new Origin({
//     year: parsed.getFullYear(),
//     month: parsed.getMonth(), // 0 = January, 11 = December!
//     date: parsed.getDate(),
//     hour: parsed.getHours(),
//     minute: parsed.getMinutes(),
//     latitude: 40.0,
//     longitude: -70.0,
//   });

//   const horoscope = new Horoscope({
//     origin: new Origin(origin),
//     houseSystem: "placidus",
//     zodiac: "sidereal",
//     aspectPoints: ["bodies", "points", "angles"],
//     aspectWithPoints: ["bodies", "points", "angles"],
//     aspectTypes: ["major", "minor"],
//     customOrbs: {},
//     language: "en",
//   });

//   const horoscope2 = new Horoscope({
//     origin: new Origin(origin),
//     houseSystem: "placidus",
//     zodiac: "tropical",
//     aspectPoints: ["bodies", "points", "angles"],
//     aspectWithPoints: ["bodies", "points", "angles"],
//     aspectTypes: ["major", "minor"],
//     customOrbs: {},
//     language: "en",
//   });

//   const sun_sidereal = horoscope.CelestialBodies.sun.Ecliptic.DecimalDegrees
//   const sun_tropical = horoscope2.CelestialBodies.sun.Ecliptic.DecimalDegrees

//   return((sun_sidereal- sun_tropical) % 360)
// }


function getDrawableData(datetime: string) {
  const parsed = new Date(datetime);


  const origin = new Origin({
    year: parsed.getFullYear(),
    month: parsed.getMonth(), // 0 = January, 11 = December!
    date: parsed.getDate(),
    hour: parsed.getHours(),
    minute: parsed.getMinutes(),
    latitude: 40.0,
    longitude: -70.0,
  });

  const horoscope = new Horoscope({
    origin: new Origin(origin),
    houseSystem: interpretSettings.value.houses,
    zodiac: interpretSettings.value.zodiac,
    aspectPoints: ["bodies", "points", "angles"],
    aspectWithPoints: ["bodies", "points", "angles"],
    aspectTypes: ["major", "minor"],
    customOrbs: {},
    language: "en",
  });

  const mapping = {
    sun: "Sun",
    moon: "Moon",
    mercury: "Mercury",
    venus: "Venus",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    uranus: "Uranus",
    neptune: "Neptune",
    pluto: "Pluto",
    chiron: "Chiron",
    northnode: "NNode",
    lillith: "Lillith",
  };

  var drawData: any = { planets: {} };
  for (const [key, value] of Object.entries(mapping)) {
    let point = horoscope.CelestialBodies[key];
    if (!point) {
      point = horoscope.CelestialPoints[key];
    }
    if (!point) {
      continue;
    }
    drawData.planets[value] = [point.ChartPosition.Ecliptic.DecimalDegrees];
  }

  for (const [_key, value] of Object.entries(getForDate(parsed))) {
    if (interpretSettings.value.fixed_stars.includes(value.name)) {

        let lat = value.abs_lat;
        if(interpretSettings.value.zodiac == "sidereal"){
            lat= value.sidereal_abs_lat
        }
      drawData.planets[value.name] = [lat];
    }
  }

  drawData.cusps = [];
  for (const [_key, value] of Object.entries(horoscope.Houses)) {
    let x: any = value;
    drawData.cusps.push(x.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
  }
  return drawData;
}

function rerender() {
  console.log("rerender");
  // ISO string
  const datetime: string = targetSettings.value.time;
  const datetime2: string = targetSettings.value.time2;

  let drawData = getDrawableData(datetime);

  let drawData2 = null;
  if (datetime2 && targetSettings.value.transit) {
    drawData2 = getDrawableData(datetime2);
  }

  positionsKey.value = computePositionsKey(drawData.planets, drawData.cusps);
  positionsKey2.value = drawData2
    ? computePositionsKey(drawData2.planets, drawData2.cusps)
    : {};

  function custom_symbol(
    name: string,
    x: number,
    y: number,
    svg: any
  ): Element {
    if (!fixedStarNames.includes(name)) {
      var sym = svg._getSymbol(name, x, y);
      if (sym) {
        return sym;
      }
    }

    var el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.textContent = name;
    el.setAttributeNS(null, "x", x.toString());
    el.setAttributeNS(null, "y", y.toString());
    return el;
  }
  const container = document.getElementById("chartcontainer");
  if (container) {
    container.innerHTML = "";
  }
  var chart = new Chart("chartcontainer", 800, 800, {
    CUSTOM_SYMBOL_FN: custom_symbol,
  });
  const radix = chart.radix(drawData);


  if (drawData2 && targetSettings.value.transit) {
    radix.transit(drawData2);
  }
  radix.aspects();

  let s = container?.firstElementChild;
  if (s) {
    s.setAttribute(
      "style",
      "max-width: calc(99% - 2em); max-height:min(95vh, 95vw); margin: auto; margin-top: 1.8rem; overflow: visible; position: relative;"
    );
  }
}

watch(targetSettings.value, () => {
  console.log("Settings changed");
  rerender();
});

watch(interpretSettings.value, () => {
  console.log("Settings changed");
  rerender();
});

onMounted(() => {
  rerender();
});
</script>

<template>
  <div class="grow flex-row">
    <div id="chartcontainer" class="grow"></div>
    <div class="flex-row gaps padding" id="positions">
      <div
        class="card w-8rem h-4-rem"
        v-for="(v, i) of positionsKey"
        v-bind:key="v"
      >
        <header class="padding"><small>{{ i }}</small></header>
        <div class="padding">
          <small>
            {{ v[1] }}{{ nthNumber(v[1]) }} {{ v[0] }} {{ v[2] }}°{{ v[3] }}′
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#chartcontainer {
  max-width: 100%;
  min-width: 18em;
  flex-basis: fit-content;
}
#positions {
    min-width: 22rem;
    flex-grow: 0.3;
    min-height: 100vh;
    overflow: scroll;
}
</style>
