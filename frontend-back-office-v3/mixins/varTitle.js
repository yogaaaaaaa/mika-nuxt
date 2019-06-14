export default {
  data() {
    return {
      merchantTitle: [
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Merchant', link: '/merchants' }
      ],
      terminalTitle: [
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Merchant Terminal', link: '/merchant-terminal/detail' }
      ],
      transactionTitle: [
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Transactions', link: '/transactions' }
      ],
      paymentGatewayTitle: [
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Payment Gateway', link: 'paymentGateway' }
      ],
      detailMerchantTitle: [ 
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Merchants', link: '/merchants' },
        { text: 'Detail Merchant', link: '#' }
      ],
      detailTerminalTitle: [
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Merchant Terminal', link: '/merchant-terminal' },
        { text: 'Detail Terminal', link: `/merchant-terminal/` }
      ],
      detailTransactionTitle: [
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Transactions', link: '/transactions' },
        { text: 'Detail Transaction', link: '/transaction/detail' }
      ],
      detailPaymentGatewayTitle: [
        { text: 'Dashboard', link: '/merchants' },
        { text: 'Payment Gateway', link: '/payment-gateway' },
        { text: 'Detail Payment Gateway', link: '#'}
      ]
    }
  }
}