<template>
  <div id="card-terminal-model">
    <v-card>
      <v-card-text>
        <v-form>
          <v-text-field v-model="model.id" label="Id"/>
          <v-text-field v-model="model.name" label="Name"/>
          <v-textarea v-model="model.description" label="Description"/>
          <v-text-field v-model="model.manufacturer" label="Manufacturer"/>
          <v-text-field v-model="model.createdAt" label="Created At"/>
          <v-text-field v-model="model.updatedAt" label="Updated At"/>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      default: () => ({
        params: value
      })
    }
  }
};
</script>

<style>
</style>
