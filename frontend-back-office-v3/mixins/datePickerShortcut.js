export default {
  methods: {
    generateShortcut() {
      const days = [
        'today',
        'yesterday',
        'this week',
        'this month',
        'last week',
        'last month',
      ]
      let shortcut = []
      days.map(d => {
        shortcut.push({
          text: d,
          onClick: () => {
            this.date1 = this.generateData(d)
          },
        })
      })
      return shortcut
    },
    generateData(type) {
      switch (type) {
        case 'today':
          return [this.$moment().startOf('day'), this.$moment().endOf('day')]

        case 'yesterday':
          return [
            this.$moment()
              .startOf('day')
              .subtract(1, 'days'),
            this.$moment().startOf('day'),
          ]

        case 'this week':
          return [this.$moment().startOf('week'), this.$moment().endOf('week')]

        case 'this month':
          return [
            this.$moment().startOf('month'),
            this.$moment().endOf('month'),
          ]

        case 'last week':
          return [
            this.$moment()
              .startOf('week')
              .subtract(1, 'weeks'),
            this.$moment().startOf('week'),
          ]

        case 'last month':
          return [
            this.$moment()
              .startOf('month')
              .subtract(1, 'months'),
            this.$moment().startOf('month'),
          ]

        default:
          return null
      }
    },
  },
}
