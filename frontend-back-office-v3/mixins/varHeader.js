export default {
  data() {
    return {
      merchantHeaders: [
        { text: "Merchant Name", value: "name" },
        { text: "Username", value: "username" },
        { text: "Email", value: "email" },
        { text: "Created At", value: "created_at" },
        { text: "Updated At", value: "updated_at" }
      ],
      terminalHeaders: [
        { text: "Terminal Name", value: "name" },
        { text: "Username", value: "username" },
        { text: "Email", value: "email" },
        { text: "Merchant", value: "merchant" },
        { text: "Created At", value: "created_at" },
        { text: "Updated At", value: "updated_at" }
        // { text: '', value: 'action'}
      ],
      transactionHeaders: [
        { text: "Transaction Id", value: "id" },
        { text: "Transaction Status", value: "transaction_status" },
        { text: "Amount", value: "amount" },
        { text: "Payment Gateway", value: "payment_gateway" },
        { text: "Terminal", value: "terminal" },
        { text: "Merchant", value: "merchant" },
        { text: "Creted At", value: "created_at" },
        { text: "Updated At", value: "updated_at" }
      ],
      paymentGatewayHeaders: [
        { text: "Name", value: "name" },
        { text: "Payment Gateway Type", value: "paymentGatewayType" },
        { text: "Credential", value: "credential" },
        { text: "Created At", value: "created_at" },
        { text: "Updated At", value: "updated_at" }
      ],
      detailTerminalHeader: [
        { text: "Username", value: "username" },
        { text: "Email", value: "email" },
        { text: "Imei", value: "imei" },
        { text: "Created At", value: "created_at" }
      ],
      detailTransactionHeaders: [
        { text: "Amount", value: "amount" },
        { text: "Payment Gateway", value: "payment_gateway" },
        { text: "Reference Number", value: "reference_number" },
        { text: "Customer", value: "customer" },
        { text: "Created At", value: "created_at" }
      ],
      detailMerchantHeaders: [
        { text: "Username", value: "username" },
        { text: "Email", value: "email" },
        { text: "Address", value: "address" },
        { text: "Created At", value: "created_at" },
        { text: "Updated At", value: "updated_at" }
      ],
      detailPaymentGatewayHeaders: [
        { text: "Status", value: "status" },
        { text: "Terminal Username", value: "terminal_username" },
        { text: "Scannable", value: "scannable" },
        { text: "Scanning", value: "scanning" },
        { text: "Minimum Transaction", value: "minimum_transaction" },
        { text: "Created At", value: "created_at" },
        { text: "Updated At", value: "updated_at" }
      ]
    };
  }
};
