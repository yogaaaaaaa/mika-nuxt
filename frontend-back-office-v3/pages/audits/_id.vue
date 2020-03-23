<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/audits" exact>
          Audit Trails
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item>{{ currentEdit.id }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-card flat>
      <v-container fluid>
        <v-card-title>Audit Details</v-card-title>
        <v-card-title>
          {{
            this.$moment(currentEdit.timestamp).format("DD MMMM YYYY, HH:mm:ss")
          }}
        </v-card-title>

        <div v-if="currentEdit.event.user.username">
          <v-card-title>User</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td>Username</td>
                    <td>
                      <b>{{ currentEdit.event.user.username }}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>User Type</td>
                    <td>
                      <b>{{ currentEdit.event.user.userType }}</b>
                    </td>
                  </tr>

                  <tr>
                    <td>User Details</td>
                    <td>
                      <vue-json-pretty :data="currentEdit.event.user" />
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </div>

        <div v-if="currentEdit.event">
          <v-card-title>Event</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td>Type</td>
                    <td>
                      <div v-if="currentEdit.event.type">
                        <b>{{ currentEdit.event.type }}</b>
                      </div>
                      <div v-else>-</div>
                    </td>
                  </tr>

                  <tr>
                    <td>Status</td>
                    <td>
                      <b>
                        {{ currentEdit.event.status }} -
                        {{ currentEdit.event.message }}
                      </b>
                    </td>
                  </tr>

                  <tr v-if="currentEdit.event.entityName">
                    <td>Entity Name</td>
                    <td>
                      <b> {{ currentEdit.event.entityName }} </b>
                    </td>
                  </tr>

                  <tr v-if="currentEdit.event.entityIds.length">
                    <td>Entity Identifiers</td>
                    <vue-json-pretty :data="currentEdit.event.entityIds" />
                  </tr>

                  <tr v-if="currentEdit.event.entityDiff">
                    <td>Entity Diff</td>
                    <vue-json-pretty
                      :data="JSON.parse(currentEdit.event.entityDiff)"
                    />
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </div>

        <div v-if="currentEdit.transport">
          <v-card-title>Transport</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td>IP Address</td>
                    <td>
                      <b> {{ currentEdit.transport.ipAddr }} </b>
                    </td>
                    <td>Type</td>
                    <td>
                      <b> {{ currentEdit.transport.type }}</b>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </div>

        <div v-if="currentEdit.transport.type === 'http'">
          <v-card-title>HTTP</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td>Method</td>
                    <td>{{ currentEdit.transport.httpMethod }}</td>
                  </tr>
                  <tr>
                    <td>Path</td>
                    <td>{{ currentEdit.transport.httpPath }}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>
                      {{ currentEdit.transport.httpStatusCode }} -
                      {{ currentEdit.transport.httpStatusMessage }}
                    </td>
                  </tr>
                  <tr>
                    <td>Header</td>
                    <td>
                      <vue-json-pretty
                        :data="JSON.parse(currentEdit.transport.httpHeader)"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Body</td>
                    <td>
                      <vue-json-pretty
                        :data="JSON.parse(currentEdit.transport.httpBody)"
                      />
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </div>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import { catchError } from "~/mixins";
import VueJsonPretty from "vue-json-pretty";
export default {
  components: {
    VueJsonPretty
  },
  mixins: [catchError],

  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get("/back_office/audits/" + params.id);
      store.commit("currentEdit", resp.data);
    } catch (e) {
      if (process.client) this.catchError(e);
      else {
        redirect("/");
      }
    }
  },

  computed: {
    currentEdit() {
      return this.$store.state.currentEdit;
    },
    remoteDetail() {
      if (this.currentEdit) {
        return JSON.parse(this.currentEdit.remote.detail);
      }
      return null;
    }
  }
};
</script>

<style></style>
