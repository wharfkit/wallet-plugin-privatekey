import {
    AbstractWalletPlugin,
    Checksum256,
    LoginContext,
    PrivateKey,
    PrivateKeyType,
    ResolvedSigningRequest,
    TransactContext,
    Transaction,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginOptions,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginOptions,
    WalletPluginSignResponse,
} from '@wharfkit/session'

export interface WalletPluginPrivateKeyOptions extends WalletPluginOptions {
    privateKey: PrivateKeyType
}

export class WalletPluginPrivateKey extends AbstractWalletPlugin implements WalletPlugin {
    readonly config: WalletPluginConfig = {
        requiresChainSelect: true,
        requiresPermissionSelect: true,
    }
    readonly metadata: WalletPluginMetadata = {
        name: 'Private Key Signer',
        description: '',
    }
    private options: WalletPluginPrivateKeyOptions
    readonly privateKey: PrivateKey
    constructor(options: WalletPluginPrivateKeyOptions) {
        super()
        this.options = options
        this.privateKey = PrivateKey.from(options.privateKey)
        const pubkey = String(this.privateKey.toPublic())
        this.metadata.description = `An unsecured wallet that can sign for authorities using the ${
            pubkey.substring(0, 11) + '...' + pubkey.substring(pubkey.length - 4, pubkey.length)
        } public key.`
    }
    get name(): string {
        return 'WalletPluginPrivateKey'
    }
    get data(): Record<string, any> {
        return this.options
    }
    async login(
        context: LoginContext,
        options: WalletPluginLoginOptions
    ): Promise<WalletPluginLoginResponse> {
        let chain: Checksum256
        if (options.chain) {
            chain = options.chain.id
        } else {
            chain = options.chains[0].id
        }
        if (!options.permissionLevel) {
            throw new Error(
                'Calling login() without a permissionLevel is not supported by the WalletPluginPrivateKey plugin.'
            )
        }
        return {
            chain,
            permissionLevel: options.permissionLevel,
        }
    }
    async sign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Promise<WalletPluginSignResponse> {
        const transaction = Transaction.from(resolved.transaction)
        const digest = transaction.signingDigest(Checksum256.from(context.chain.id))
        const signature = this.privateKey.signDigest(digest)
        return {
            signatures: [signature],
        }
    }
}
