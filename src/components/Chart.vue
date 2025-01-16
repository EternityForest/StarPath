<script setup lang="ts">
import { onMounted, watch, ref, type Ref } from "vue";
import { Chart } from "@astrodraw/astrochart";
import { Origin, Horoscope } from "circular-natal-horoscope-js";
import {calculateAyanamsa} from "../ayanamsa";

import {
  targetSettings,
  interpretSettings,
  manuallyAddedFixedStars,
} from "../app";
import { getForDate, fixedStarNames } from "../fixedstars";

// defineProps<{ msg: string }>()

//const count = ref(0)

const positionsKey: Ref<{
  [key: string]: {
    sign: string;
    house: number;
    degree: number;
    minute: number;
    retrograde: boolean;
  };
}> = ref({});

const positionsKey2: Ref<{
  [key: string]: {
    sign: string;
    house: number;
    degree: number;
    minute: number;
    retrograde: boolean;
  };
}> = ref({});
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
): {
  [key: string]: {
    sign: string;
    house: number;
    degree: number;
    minute: number;
    retrograde: boolean;
  };
} {
  let result: {
    [key: string]: {
      sign: string;
      house: number;
      degree: number;
      minute: number;
      retrograde: boolean;
    };
  } = {};

  // [cusp, house zero based] starting at the lowest degreee number cusp
  let house_cusps_offset = [];
  for (let i = 0; i < cusps.length; i++) {
    house_cusps_offset.push([cusps[i], i]);
  }
  house_cusps_offset.sort((a, b) => a[0] - b[0]);

  for (const [key, value] of Object.entries(planets)) {
    let house: number = 12;
    let ecliptic = value[0];
    let sign = Math.floor(ecliptic / 30);
    for (const cusp of house_cusps_offset) {
      if (ecliptic >= cusp[0]) {
        house = cusp[1] + 1;
      }
    }

    let deg = Math.floor(ecliptic - 30 * sign);
    let minutes = Math.round((ecliptic - 30 * sign - deg) * 60);
    let retrograde = value[1] < 0;
    result[key] = {
      sign: signs_en[sign],
      house: house,
      degree: deg,
      minute: minutes,
      retrograde: retrograde,
    };
  }
  return result;
}

function autoAddFixedStarsForChart(
  drawData: any,
  fixedStarData: {
    abs_lat: number;
    name: string;
    magnitude: number;
    sidereal_abs_lat: number;
    orb: number;
  }[]
) {
  const unseenFixed: string[] = Object.values(fixedStarNames);

  for (const [_key, value] of Object.entries(fixedStarData)) {
    for (const [_key2, value2] of Object.entries(drawData.planets)) {
      if (fixedStarNames.includes(_key2)) {
        continue;
      }
      let value2_t: number[] = value2 as unknown as number[];

      let fixed_star_pos = value.abs_lat;

      if (interpretSettings.value.zodiac == "sidereal") {
        fixed_star_pos = value.sidereal_abs_lat;
      }

      if (Math.abs(value2_t[0] - fixed_star_pos) < value.orb) {
        if (!interpretSettings.value.fixed_stars.includes(value.name)) {
          if (value.magnitude <= 2.2) {
            console.log("Auto added fixed star: " + value.name);
            interpretSettings.value.fixed_stars.push(value.name);
          }
        }
        if (unseenFixed.includes(value.name)) {
          unseenFixed.splice(unseenFixed.indexOf(value.name), 1);
        }
      }
    }
  }

  for (const v of unseenFixed) {
    if (!manuallyAddedFixedStars.value[v]) {
      if (interpretSettings.value.fixed_stars.includes(v)) {
        interpretSettings.value.fixed_stars.splice(
          interpretSettings.value.fixed_stars.indexOf(v),
          1
        );
      }
    }
  }
}

function getDrawableData(datetime: string, lat: number, lon: number) {
  const parsed = new Date(datetime);

  let ayanamsa = 0;

  if(interpretSettings.value.zodiac == "sidereal") {
    ayanamsa = calculateAyanamsa(parsed, "fagan-bradley");
  }
  else if(interpretSettings.value.zodiac == "sidereal-lahiri") {
    ayanamsa = calculateAyanamsa(parsed, "lahiri");
  }



  const origin = new Origin({
    year: parsed.getFullYear(),
    month: parsed.getMonth(), // 0 = January, 11 = December!
    date: parsed.getDate(),
    hour: parsed.getHours(),
    minute: parsed.getMinutes(),
    latitude: lat,
    longitude: lon,
  });

  const horoscope = new Horoscope({
    origin: new Origin(origin),
    houseSystem: interpretSettings.value.houses,
    zodiac: "tropical",
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

  const fixedStarData = getForDate(parsed);

  var drawData: any = { planets: {} };
  for (const [key, value] of Object.entries(mapping)) {
    let point = horoscope.CelestialBodies[key];
    if (!point) {
      point = horoscope.CelestialPoints[key];
    }
    if (!point) {
      continue;
    }

    let v = point.ChartPosition.Ecliptic.DecimalDegrees;
    v -= ayanamsa;
    

    // Second val is i think supposed to be speed but only the sign actually gets used.
    drawData.planets[value] = [
      
      v,
      point.isRetrograde ? -1 : 1,
    ];
  }

  for (const [_key, value] of Object.entries(fixedStarData)) {
    if (interpretSettings.value.fixed_stars.includes(value.name)) {
      let lat = value.abs_lat-ayanamsa;
      drawData.planets[value.name] = [lat, 1];
    }
  }


  drawData.cusps = [];
  for (const [_key, value] of Object.entries(horoscope.Houses)) {
    let x: any = value;
    drawData.cusps.push(x.ChartPosition.StartPosition.Ecliptic.DecimalDegrees-ayanamsa);
  }
  return drawData;
}

/*Global side effect, this modifies the fixed star selection if it finds anything*/
function rerender(recheckFixedStars: boolean = false) {
  console.log("rerender");
  // ISO string
  const datetime: string = targetSettings.value.time;
  const datetime2: string = targetSettings.value.time2;

  let drawData = getDrawableData(
    datetime,
    targetSettings.value.lat,
    targetSettings.value.lon
  );

  let fixedStarData = getForDate(new Date(datetime));
  if (recheckFixedStars) {
    autoAddFixedStarsForChart(drawData, fixedStarData);
  }

  let drawData2 = null;
  if (datetime2 && targetSettings.value.transit) {
    drawData2 = getDrawableData(
      datetime2,
      targetSettings.value.lat2,
      targetSettings.value.lon2
    );

    fixedStarData = getForDate(new Date(datetime));
    if (recheckFixedStars) {
      autoAddFixedStarsForChart(drawData2, fixedStarData);
    }
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
    el.setAttributeNS(null, "fill", "#a3a38e");

    x = (x * 7 + 400) / 8;
    y = (y * 7 + 400) / 8;
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
    if (targetSettings.value.transit) {
      s.setAttribute(
        "style",
        "max-width: calc(99% - 2em); max-height:min(95vh, 95vw); margin: auto; margin-top: 1.8rem; overflow: visible; position: relative;"
      );
    } else {
      s.setAttribute(
        "style",
        "max-width: calc(99% ); max-height:min(95vh, 99vw); margin: auto; margin-top: 0.4rem; overflow: visible; position: relative;"
      );
    }
  }
}

watch(targetSettings.value, () => {
  console.log("Settings changed");
  rerender(true);
});

watch(interpretSettings.value, () => {
  console.log("Settings changed");
  rerender();
});

onMounted(() => {
  rerender(true);
});
</script>

<template>
  <div class="grow flex-row">
    <div id="chartcontainer" class="grow"></div>
    <div class="flex-row gaps padding" id="positions">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Sign</th>
            <th>House</th>
            <th>Degree</th>
          </tr>
        </thead>
        <tbody class="scroll">
          <tr
            class="card w-8rem h-4-rem"
            v-for="(v, i) of positionsKey"
            v-bind:key="i"
          >
            <td>
              {{ i }}<span title="Retrograde" v-if="v.retrograde">(r)</span>
            </td>
            <td>{{ v.sign }}</td>
            <td>{{ v.house }}{{ nthNumber(v.house) }}</td>
            <td>{{ v.degree }}°{{ v.minute }}'</td>
          </tr>
        </tbody>
      </table>
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
