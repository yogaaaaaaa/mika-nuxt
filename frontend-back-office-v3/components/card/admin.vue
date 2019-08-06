<template>
  <div class="admin">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Edit Admin
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="putAdmin()">
        <v-card-text>
          <v-text-field label="Name" v-model="name"/>
          <v-text-field label="Username" v-model="username"/>
          <v-text-field label="Email" v-model="email"/>
          <v-combobox v-model="roles" label="Role" :items="roleItem" multiple chips/>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { timeFormat, exit } from "~/mixins";
import { mapState } from "vuex";

export default {
  mixins: [timeFormat, exit],
  data() {
    return {
      name: "",
      username: "",
      email: "",
      roles: [],
      afterEdit: "",
      // roleItem: [
      //   { text: "Admin Head", value: "adminHead" },
      //   { text: "Admin Finance", value: "adminFinance" },
      //   { text: "Admin Marketing", value: "adminMarketing" },
      //   { text: "Admin Logistic", value: "adminLogistic" },
      //   { text: "Admin Support", value: "adminSupport" }
      // ]
      roleItem: [
        "adminHead",
        "adminFinance",
        "adminMarketing",
        "adminLogistic",
        "adminSupport"
      ]
    };
  },
  watch: {
    admin: {
      immediate: true,
      handler() {
        this.name = this.admin.name;
        this.email = this.admin.email;
        this.username = this.user.username;
        this.roles = this.user.userRoles;
      }
    }
  },
  computed: {
    ...mapState(["admin", "user"])
  },
  methods: {
    edit: function() {
      this.$emit("edit");
    },
    async putAdmin() {
      await this.$axios
        .$put(`/api/back_office/admins/${this.$route.params.id}`, {
          name: this.name,
          email: this.email
        })
        .then(r => {
          this.refresh();
          this.close();
        })
        .catch(e => console.log("error admin", e));
    }
  }
};
</script>

<style>
</style>
