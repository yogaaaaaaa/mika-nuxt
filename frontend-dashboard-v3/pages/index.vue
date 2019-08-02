<template>
  <v-card flat>
    <v-card-title>Transactions</v-card-title>
    <v-tabs>
      <v-tab>
        <v-icon left>table_chart</v-icon>Table
      </v-tab>
      <v-tab>
        <v-icon left>show_chart</v-icon>Chart
      </v-tab>

      <v-tab-item>
        <transactions></transactions>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <v-sparkline
              :value="value"
              :gradient="gradient"
              :smooth="radius || false"
              :padding="padding"
              :line-width="width"
              :stroke-linecap="lineCap"
              :gradient-direction="gradientDirection"
              :fill="fill"
              :type="type"
              :auto-line-width="autoLineWidth"
              auto-draw
            ></v-sparkline>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import transactions from "../components/transactions";
const gradients = [
  ["#222"],
  ["#42b3f4"],
  ["red", "orange", "yellow"],
  ["purple", "violet"],
  ["#00c6ff", "#F0F", "#FF0"],
  ["#f72047", "#ffd200", "#1feaea"]
];
export default {
  components: { transactions },
  data() {
    return {
      width: 2,
      radius: 10,
      padding: 8,
      lineCap: "round",
      gradient: gradients[5],
      value: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0],
      gradientDirection: "top",
      gradients,
      fill: false,
      type: "trend",
      autoLineWidth: false
    };
  }
};
</script>
