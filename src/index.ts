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
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginSignResponse,
} from '@wharfkit/session'

export interface WalletPluginPrivateKeyOptions {
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
        this.metadata.publicKey = this.privateKey.toPublic()
        this.metadata.description = `An unsecured wallet that can sign for authorities using the ${
            String(this.metadata.publicKey).substring(0, 11) +
            '...' +
            String(this.metadata.publicKey).substring(
                String(this.metadata.publicKey).length - 4,
                String(this.metadata.publicKey).length
            )
        } public key.`
    }
    get id(): string {
        return 'keysigner'
    }
    get data(): Record<string, any> {
        return this.options
    }
    async login(context: LoginContext): Promise<WalletPluginLoginResponse> {
        let chain: Checksum256
        if (context.chain) {
            chain = context.chain.id
        } else {
            chain = context.chains[0].id
        }
        if (!context.permissionLevel) {
            throw new Error(
                'Calling login() without a permissionLevel is not supported by the WalletPluginPrivateKey plugin.'
            )
        }
        return {
            chain,
            permissionLevel: context.permissionLevel,
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
