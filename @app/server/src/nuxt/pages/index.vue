<template>
  <section>
    <h1 class="header">Index</h1>
    <div class="cards">
      <CustomCard v-for="person in people" :key="person.id" :person="person"></CustomCard>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { State } from "vuex-class";
import { Person } from "~/types";
import CustomCard from "~/components/CustomCard.vue";

@Component({
  components: {
    CustomCard,
  },
})
export default class extends Vue {
  @State people!: Person;
}
</script>

<style scoped>
.header {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.cards {
  display: flex;
  flex-wrap: wrap;
}
</style>
