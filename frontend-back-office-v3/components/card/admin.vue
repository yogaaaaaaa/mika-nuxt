<template>
  <div class="admin">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field label="Name" v-model="admin.name" />
          <v-text-field label="Username" v-model="username" />
          <v-text-field label="Email" v-model="admin.email" v-if="admin.email"/>
          <v-text-field label="Created At" v-model="admin.createdAt" />
          <v-text-field label="Updated At" v-model="admin.updatedAt" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { timeFormat } from "~/mixins"

export default {
  props: {
    admin: {
      type: Object,
      required: true
    },
    username: {
      type: String,
      required: ""
    }
  },
  mixins: [timeFormat]
}
</script>

<style>

</style>
