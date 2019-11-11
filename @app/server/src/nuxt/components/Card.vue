<template>
  <div class="card">
    <h2> </h2>
    <img :src="'https://robohash.org/' + person.first_name + '_' + person.last_name" />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from "nuxt-property-decorator"
import { Person } from "~/types";

@Component({})
export default class Card extends Vue {
  @Prop() person!: Person
}
</script>

<style scoped>
.card {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana,
    sans-serif;
  padding: 1rem;
  margin: 0.25rem;
  border: 0.25rem solid gainsboro;
}
</style>
