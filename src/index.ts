import {
    Checksum256,
    LoginContext,
    PrivateKey,
    PrivateKeyType,
    ResolvedSigningRequest,
    Signature,
    TransactContext,
    Transaction,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginOptions,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginOptions,
} from '@wharfkit/session'

export interface WalletPluginPrivateKeyOptions extends WalletPluginOptions {
    privateKey: PrivateKeyType
}

export class WalletPluginPrivateKey implements WalletPlugin {
    readonly config: WalletPluginConfig = {
        requiresChainSelect: true,
        requiresPermissionSelect: true,
    }
    readonly metadata: WalletPluginMetadata = {
        name: 'Private Key Signer',
        description: '',
    }
    privateKey: PrivateKey
    constructor(options: WalletPluginPrivateKeyOptions) {
        this.privateKey = PrivateKey.from(options.privateKey)
        const pubkey = String(this.privateKey.toPublic())
        this.metadata.description = `An unsecured wallet that can sign for authorities using the ${
            pubkey.substring(0, 11) + '...' + pubkey.substring(pubkey.length - 4, pubkey.length)
        } public key.`
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
    async sign(resolved: ResolvedSigningRequest, context: TransactContext): Promise<Signature> {
        const transaction = Transaction.from(resolved.transaction)
        const digest = transaction.signingDigest(Checksum256.from(context.chain.id))
        return this.privateKey.signDigest(digest)
    }
}
