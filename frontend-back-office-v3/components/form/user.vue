<template>
  <div class="user" v-show="show" persistent>
    <v-card>
      <v-card-title>Create User</v-card-title>
      <v-form @submit="$emit('postUser')">
        <v-card-text>
          <v-text-field v-model="user.username" @input="doChange($event)" label="Username"/>
          <v-text-field v-model="user.password" label="Password" type="password"/>
          <v-text-field v-model="user.email" label="Email"/>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    admin: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      user: {}
    };
  },
  computed: {
    showInput: {
      get: function() {
        return this.show;
      }
    }
  },
  methods: {
    postUser() {},
    doChange(inputValue) {
      return console.log("coba coba coba", inputValue);
    }
  }
};
</script>

<style>
</style>
