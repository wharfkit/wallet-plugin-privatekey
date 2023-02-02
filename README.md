# @wharfkit/wallet-plugin-privatekey

A @wharfkit/session WalletPlugin implementation that takes a private key and blindly signs transactions.

Primarily designed to be used in controlled environments (such as server side applications) or for testing purposes.

## Usage

```ts
import {Session} from '@wharfkit/session'
import {WalletPluginPrivateKey} from '@wharfkit/wallet-plugin-privatekey'

// Establish a session and include the wallet plugin
const session = new Session({
    // ... other options
    walletPlugin: new WalletPluginPrivateKey({
        privateKey: '5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s',
    }),
})

// Calling transact will use this plugin to automatically sign with the provided key
const result = session.transact({
    actions: [
        // your actions
    ],
})
```

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
