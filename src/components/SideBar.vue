<script setup lang="ts">
import {
  targetSettings,
  interpretSettings,
  sharingUrl,
  manuallyAddedFixedStars,
} from "../app";
import { ref } from "vue";
import { fixedStarNames } from "../fixedstars";
import { cachedSearch } from "../wikipediageocoder";

const fixedstarssearch = ref("");

async function doLocationSearch() {
  try {
    let r = await cachedSearch(targetSettings.value.location);
    if (r) {
      targetSettings.value.lat = r.lat;
      targetSettings.value.lon = r.lon;
      targetSettings.value.location = r.name;
    }
  } catch (e) {
    console.log(e);
    alert(e);
  }
}

async function doLocationSearch2() {
  try {
    let r = await cachedSearch(targetSettings.value.location2);
    if (r) {
      targetSettings.value.lat2 = r.lat;
      targetSettings.value.lon2 = r.lon;
      targetSettings.value.location2 = r.name;
    }
  } catch (e) {
    console.log(e);
    alert(e);
  }
}

// defineProps<{ msg: string }>()

//const count = ref(0)
</script>

<template>
  <div class="card w-sm-full" id="sidebar">
    <header>Settings</header>
    <div class="scroll">
      <a :href="sharingUrl">
        <h3>Share</h3>
      </a>
      <h3>Target</h3>
      <div class="stacked-form">
        <label
          >Name
          <input type="text" v-model="targetSettings.name" />
        </label>
        <label
          >Time
          <input type="datetime-local" v-model="targetSettings.time" />
        </label>

        <label
          >Location
          <input type="text" v-model="targetSettings.location" />
        </label>

        <button @click="doLocationSearch()">Search Coords</button>
        <label
          >Lattitude
          <input
            type="number"
            min="-180"
            max="180"
            step="0.0000000001"
            v-model="targetSettings.lat"
          />
        </label>
        <label
          >Longitude
          <input
            type="number"
            min="-180"
            max="180"
            step="0.0000000001"
            v-model="targetSettings.lon"
          />
        </label>
      </div>

      <details>
        <summary>
          <h3>Synastry/Transit</h3>
        </summary>
        <div class="stacked-form">
          <p class="help">This will be the outer ring if enabled.</p>
          <label
            >Enable
            <input type="checkbox" v-model="targetSettings.transit" />
          </label>
          <label
            >Name
            <input type="text" v-model="targetSettings.name2" />
          </label>
          <label
            >Time
            <input type="datetime-local" v-model="targetSettings.time2" />
          </label>
          <label
            >Location
            <input type="text" v-model="targetSettings.location2" />
          </label>

          <button @click="doLocationSearch2()">Search Coords</button>
          <label
            >Lattitude
            <input
              type="number"
              min="-180"
              max="180"
              step="0.0000000001"
              v-model="targetSettings.lat2"
            />
          </label>
          <label
            >Longitude
            <input
              type="number"
              min="-180"
              max="180"
              step="0.0000000001"
              v-model="targetSettings.lon2"
            />
          </label>
        </div>
      </details>

      <h3>Interpret</h3>
      <div class="stacked-form">
        <label
          >Chart Type
          <select v-model="interpretSettings.zodiac">
            <option value="tropical">Tropical/Western</option>
            <option value="sidereal">Siderial(Fagan-Bradley)</option>
            <option value="sidereal-lahiri">Siderial(Lahiri)</option>

          </select>
        </label>
        <label>
          Houses
          <select v-model="interpretSettings.houses">
            <option value="placidus">Placidus</option>
            <option value="whole-sign">Whole Signs</option>
            <option value="regiomontanus">Regiomontanus</option>
            <option value="koch">Koch</option>
            <option value="equal-house">Equal Houses</option>
            <option value="campanus">Campanus</option>
          </select>
        </label>

        <h4>Fixed Stars</h4>
        <label> Active </label>
        <div class="scroll max-h-12rem flex-col w-full">
          <button
            v-for="(v, _i) of interpretSettings.fixed_stars"
            class="nogrow"
            v-on:click="
              interpretSettings.fixed_stars.splice(_i, 1);
              manuallyAddedFixedStars[v] = false;
            "
            v-bind:key="v"
          >
            X {{ v }}
          </button>
        </div>
        <label> Available </label>
        <input type="text" v-model="fixedstarssearch" placeholder="Search" />
        <div class="scroll h-12rem flex-col w-full">
          <button
            v-for="(v, _i) of fixedStarNames
              .filter((v) =>
                v.toLowerCase().includes(fixedstarssearch.toLowerCase())
              )
              .sort()"
            class="nogrow"
            v-on:click="
              interpretSettings.fixed_stars.includes(v) ||
                interpretSettings.fixed_stars.push(v);
              manuallyAddedFixedStars[v] = true;
            "
            v-bind:key="v"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#sidebar {
  max-height: 100vh;
}
</style>
