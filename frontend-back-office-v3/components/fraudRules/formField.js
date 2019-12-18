import changeCase from 'change-case'

const types = ['high', 'low']
// const ranges = ['day', 'month', 'year']

const baseFormField = (key, caption) => {
  return {
    key,
    caption,
    fieldType: 'text',
    rules: 'required|integer',
    type: 'number',
    value: '2',
  }
}

/**
 * recency
 */

const recency = []
const recencyKeys = ['masked_pan', 'msisdn']

recency.push({
  key: 'id_merchant',
  caption: 'Merchant',
  fieldType: 'selectObject',
  rules: 'required|integer',
  value: '',
  props: 'merchants',
})

recencyKeys.map(r => {
  types.map(t => {
    recency.push(baseFormField(`${r}.${t}`, changeCase.titleCase(`${r} ${t}`)))
  })
})

/**
 * frequency
 */

const frequency = []
const frequencyKeys = [
  'masked_pan',
  'msisdn',
  'id_outlet',
  'id_agent',
  'id_merchant',
]

frequencyKeys.map(r => {
  types.map(t => {
    frequency.push(
      baseFormField(`${r}.${t}`, changeCase.titleCase(`${r} ${t}`))
    )
  })
})

/**
 * monetary
 */

const monetary = []
const monetaryKeys = [
  'masked_pan_average',
  'msisdn_average',
  'id_outlet_average',
  'id_agent_average',
  'id_merchant_average',
]

monetaryKeys.map(r => {
  types.map(t => {
    monetary.push(baseFormField(`${r}.${t}`, changeCase.titleCase(`${r} ${t}`)))
  })
})

/**
 * velocity
 */

const velocity = []
const velocityKeys = [
  'masked_pan',
  'msisdn',
  'id_outlet',
  'id_agent',
  'id_merchant',
]

velocityKeys.map(r => {
  types.map(t => {
    velocity.push(baseFormField(`${r}.${t}`, changeCase.titleCase(`${r} ${t}`)))
  })
})

export default {
  recency,
  frequency,
  monetary,
  velocity,
}

// {
//   "range": "day",
//   "masked_pan": {
//       "high": 10,
//     "low": 2
//   },
//   "msisdn": {
//       "high": 10,
//     "low": 2
//   },
//   "id_outlet": {
//       "high": 10,
//     "low": 2
//   },
//   "id_agent": {
//       "high": 10,
//     "low": 2
//   },
//   "id_merchant": {
//       "high": 10,
//     "low": 2
//   }
// }
