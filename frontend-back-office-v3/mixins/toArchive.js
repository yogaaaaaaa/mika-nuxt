export default {
  methods: {
    async archive() {
      try {
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          {
            archivedAt: true,
          }
        )
        if (response.status !== 'ent-406') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', `Data successfuly archived`)
          this.$router.go(-1)
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    async unarchived() {
      try {
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          {
            archivedAt: false,
          }
        )
        if (response.status !== 'ent-406') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', `Data successfuly unarchived`)
          this.$router.go(-1)
        }
      } catch (e) {
        this.catchError(e)
      }
    },
  },
}
