# mika-tools
Collection of tools for test and debugging purposes. 
Install dependency first using `npm install`

## fake-qrcode-tcash
  Masquerade as TCASH MFS with TCASH Qrcode content as input.
  ```bash
  # show help
  node fake-qrcode-tcash.js --help
  # example usage with qrcode TWALLET|O|mika|0000011097
  node fake-qrcode-tcash.js \
    --qrcode "TWALLET|O|mika|0000011097" --inqurl "https://api.mikaapp.id/transaction/tcash/inquiry" \
    --payurl "https://api.mikaapp.id/transaction/tcash/pay"
  ```

## mqtt-check
  MQTT simple echo test to selected broker
  ```bash
  # show help
  node mqtt-check.js --help
  # start test
  node mqtt-check.js --url wss://broker.mikaapp.id --username user --password pass
  ```
## bcrypt
  Generate and compare bcrypt hash
  ```bash
  # show help
  node bcrypt.js --help
  # generate hash
  node bcrypt.js gen 'hello'
  # generate hash in bulk
  node bcrypt.js gen 'hello' 'hello2' 'hello3'
  ```

## api-key
  Generate random external/public api key
  ```bash
  # show help
  node api-key.js --help
  # generate api-key
  node api-key.js
  ```

## cbkey
  Generate random cipherbox key
  ```bash
  # show help
  node cbkey.js --help
  # generate cb1 key (client and server)
  node cbkey.js cb1
  # generate cb3 key
  node cbkey.js cb3
  ```