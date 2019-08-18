<template>
  <div>
    <v-card class="pa-4">
      <v-card-text>
        <v-flex>
          <v-layout wrap>
            <div style="width: 35%">Id Alias</div>
            <span>:</span>
            <div class="ml-1">{{ transaction.idAlias }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Amount</div>
            <span>:</span>
            <div class="ml-1">{{ toCurrency(transaction.amount) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Status</div>
            <span>:</span>
            <div class="ml-1">{{ transaction.status }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Settlemen Status</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.settlementStatus">{{ transaction.settlementStatus }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Reference Number</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.referenceNumber">{{ transaction.referenceNumber }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Reference Number Name</div>
            <span>:</span>
            <div
              class="ml-1"
              v-if="transaction.referenceNumberName"
            >{{ transaction.referenceNumberName }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Card Approval Code</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.cardApprovalCode">{{ transaction.cardApprovalCode }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Card Network</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.cardNetwork">{{ transaction.cardNetwork }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Card Issuer</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.cardIssuer">{{ transaction.cardIssuer }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Card Acquirer</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.cardAcquirer">{{ transaction.cardAcquirer }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Card Pan</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.cardPan">{{ transaction.cardPan }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Card Type</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.cardType">{{ transaction.cardType }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Location Long</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.locationLong">{{ transaction.locationLong }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Location Lat</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.locationLat">{{ transaction.locationLat }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">IP Address</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.ipAddress">{{ transaction.ipAddress }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Void Reason</div>
            <span>:</span>
            <div class="ml-1" v-if="transaction.voidReason">{{ transaction.voidReason }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Agent Name</div>
            <span>:</span>
            <div class="ml-1" style="margin-top: -12px">
              <v-tooltip right>
                <v-btn
                  slot="activator"
                  round
                  flat
                  style="margin-left: -15px;"
                  class="tbl"
                  @click="toDetailAgent(agent.id);"
                >{{ agent.name }}</v-btn>
                <span>View detail</span>
              </v-tooltip>
            </div>
          </v-layout>
          <v-layout wrap style="margin-top: -12px">
            <div style="width: 35%">Terminal Name</div>
            <span>:</span>
            <div class="ml-1" style="margin-top: -12px" v-if="terminal.name">
              <v-tooltip right>
                <v-btn
                  slot="activator"
                  round
                  flat
                  style="margin-left: -15px;"
                  class="tbl"
                  @click="toDetailTerminal(terminal.id);"
                >{{ terminal.name }}</v-btn>
                <span>View detail</span>
              </v-tooltip>
            </div>
            <div class="ml-1" style="margin-bottom: 12px" v-else>-</div>
          </v-layout>
          <v-layout wrap style="margin-top: -12px">
            <div style="width: 35%">Acquirer Name</div>
            <span>:</span>
            <div class="ml-1" style="margin-top: -12px">
              <v-tooltip right>
                <v-btn
                  slot="activator"
                  round
                  flat
                  style="margin-left: -15px;"
                  class="tbl"
                  @click="toDetaiAquirer(acquirer.id);"
                >{{ acquirer.name }}</v-btn>
                <span>View detail</span>
              </v-tooltip>
            </div>
          </v-layout>
          <v-layout wrap style="margin-top: -12px">
            <div style="width: 35%">Outlet Name</div>
            <span>:</span>
            <div class="ml-1" style="margin-top: -12px">
              <v-tooltip right>
                <v-btn
                  slot="activator"
                  round
                  flat
                  style="margin-left: -15px;"
                  class="tbl"
                  @click="toDetailOutlet(outlet.id);"
                >{{ outlet.name }}</v-btn>
                <span>View detail</span>
              </v-tooltip>
            </div>
          </v-layout>
          <v-layout wrap style="margin-top: -12px">
            <div style="width: 35%">Merchant Name</div>
            <span>:</span>
            <div class="ml-1" style="margin-top: -12px">
              <v-tooltip right>
                <v-btn
                  slot="activator"
                  round
                  flat
                  style="margin-left: -15px;"
                  class="tbl"
                  @click="toDetailMerchant(merchant.id);"
                >{{ merchant.name }}</v-btn>
                <span>View detail</span>
              </v-tooltip>
            </div>
          </v-layout>
          <v-layout wrap style="margin-top: -12px">
            <div style="width: 35%">Created At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDateToHours(transaction.createdAt) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDateToHours(transaction.updatedAt) }}</div>
          </v-layout>
        </v-flex>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { timeFormat, toDetail } from "~/mixins";

export default {
  props: {
    transaction: {
      type: Object,
      default: () => ({})
    },
    agent: {
      type: Object,
      default: () => ({})
    },
    terminal: {
      type: Object,
      default: () => ({})
    },
    acquirer: {
      type: Object,
      default: () => ({})
    },
    outlet: {
      type: Object,
      default: () => ({})
    },
    merchant: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [timeFormat, toDetail]
};
</script>

<style scoped>
.top {
  margin-top: -12px;
}
</style>
