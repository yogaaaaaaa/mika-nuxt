<template>
  <div>
    <div class="page-title">
      <h3 class="title">Transactions</h3>
    </div>
    <transactions></transactions>
  </div>
</template>

<script>
import transactions from "../components/transactions";
export default {
  components: { transactions }
};
</script>
<style lang="scss" scoped>
.page-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>

