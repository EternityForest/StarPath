<script setup lang="ts">
import { targetSettings, interpretSettings } from "../app";
import { ref } from "vue";
import { fixedStarNames } from "../fixedstars";

const fixedstarssearch = ref("");

// defineProps<{ msg: string }>()

//const count = ref(0)
</script>

<template>
  <div class="card w-sm-full" id="sidebar">
    <header>Settings</header>
    <div class="scroll">
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
    </div>

    <h3>Synastry/Transit</h3>
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
    </div>

    <h3>Interpret</h3>
    <div class="stacked-form">
      <label
        >Chart Type
        <select v-model="interpretSettings.zodiac">
          <option value="tropical">Tropical/Western</option>
          <option value="sidereal">Siderial</option>
        </select>
      </label>
      <label>
        Houses
        <select v-model="interpretSettings.houses">
          <option value="placidus">Placidus</option>
          <option value="whole-sign">Whole Signs</option>
        </select>
      </label>

      <h4>Fixed Stars</h4>
      <label> Active </label>
      <div class="scroll max-h-12rem flex-col w-full">
        <button
          v-for="(v, _i) of interpretSettings.fixed_stars"
          class="nogrow"
          v-on:click="interpretSettings.fixed_stars.splice(_i, 1)"
          v-bind:key="v"
        >
        X {{ v }}
        </button>
      </div>
      <label> Available </label>
      <input type="text" v-model="fixedstarssearch" placeholder="Search" />
      <div class="scroll h-12rem flex-col w-full">
        <button
          v-for="(v, _i) of fixedStarNames.filter((v) =>
            v.toLowerCase().includes(fixedstarssearch.toLowerCase())
          )"
          class="nogrow"
          v-on:click="
            interpretSettings.fixed_stars.includes(v) ||
            interpretSettings.fixed_stars.push(v)
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
