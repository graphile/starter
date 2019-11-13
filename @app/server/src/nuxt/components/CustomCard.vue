<template>
  <card class="card">
    <img
      :src="
        'https://robohash.org/' + person.first_name + '_' + person.last_name
      "
    />
    <template class="ant-card-actions" slot="actions">
      <icon type="like" />
      <icon type="edit" />
      <icon type="ellipsis" />
    </template>
    <!-- <Button>I like it!</Button> -->
  </card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";
import { Person } from "~/types";
import { Button, Card, Icon } from "ant-design-vue";

@Component({
  components: {
    Button,
    Card,
    Icon,
  },
})
export default class CustomCard extends Vue {
  @Prop() person!: Person;
}
</script>

<style scoped>
.card {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>
