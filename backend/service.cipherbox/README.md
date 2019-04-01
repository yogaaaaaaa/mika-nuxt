# service.cipherbox
This service providing all-around crypto functionality to mika backend system with `cipherbox`.

# What is `cipherbox`
`cipherbox` is crypto infrastructure to transparently encrypt and decrypt message in and out on mika backend using common crypto algorithm (hmac, aes and rsa).
All crypto data is exchanged using JSON as serialization format. It include its dependency, such as initialization vector, key seed, etc
## Crypto scheme
`cipherbox` provide several scheme. Each scheme has its own key generation method and crypto algorithm. Four scheme has been defined, 
 - cb0 : Plain old encryption using aes-256-cbc encryption and hmac-sha256 for authentication
 - cb1 : Hybrid cryptosystem, using RSA to create session key for aes-256-cbc encryption with hmac-sha256 for authentication
 - cb2 : DUKPT with IPEK and KSN (20 bit counter) with aes-256-cbc and hmac-sha256 for authentication (not implemented)
 - cb3 : hmac-sha256 key generation with aes-256-cbc and hmac-sha256 for authentication
