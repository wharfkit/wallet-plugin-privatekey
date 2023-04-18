import {
    AbstractWalletPlugin,
    cancelable,
    Cancelable,
    Checksum256,
    LoginContext,
    PrivateKey,
    PrivateKeyType,
    ResolvedSigningRequest,
    TransactContext,
    Transaction,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginSignResponse,
} from '@wharfkit/session'

export interface WalletPluginPrivateKeyOptions {
    privateKey: PrivateKeyType
}

export class WalletPluginPrivateKey extends AbstractWalletPlugin implements WalletPlugin {
    public id = 'wallet-plugin-privatekey'
    readonly config: WalletPluginConfig = {
        requiresChainSelect: true,
        requiresPermissionSelect: true,
    }
    readonly metadata: WalletPluginMetadata = WalletPluginMetadata.from({
        name: 'Private Key Signer',
        description: '',
    })
    constructor(privateKeyData: PrivateKeyType) {
        super()
        const privateKey = PrivateKey.from(privateKeyData)
        this.data.privateKey = privateKey
        this.metadata.publicKey = String(privateKey.toPublic())
        this.metadata.description = `An unsecured wallet that can sign for authorities using the ${
            String(this.data.publicKey).substring(0, 11) +
            '...' +
            String(this.data.publicKey).substring(
                String(this.data.publicKey).length - 4,
                String(this.data.publicKey).length
            )
        } public key.`
    }
    login(context: LoginContext): Cancelable<WalletPluginLoginResponse> {
        let chain: Checksum256
        if (context.chain) {
            chain = context.chain.id
        } else {
            chain = context.chains[0].id
        }
        return cancelable(
            new Promise((resolve, reject) => {
                if (!context.permissionLevel) {
                    return reject(
                        'Calling login() without a permissionLevel is not supported by the WalletPluginPrivateKey plugin.'
                    )
                }
                resolve({
                    chain,
                    permissionLevel: context.permissionLevel,
                })
            })
        )
    }
    sign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Cancelable<WalletPluginSignResponse> {
        return cancelable(
            new Promise((resolve) => {
                const transaction = Transaction.from(resolved.transaction)
                const digest = transaction.signingDigest(Checksum256.from(context.chain.id))
                const privateKey = PrivateKey.from(this.data.privateKey)
                const signature = privateKey.signDigest(digest)
                resolve({
                    signatures: [signature],
                })
            })
        )
    }
}
