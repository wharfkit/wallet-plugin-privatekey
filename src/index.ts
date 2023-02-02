import {
    ChainDefinition,
    Checksum256,
    PrivateKey,
    PrivateKeyType,
    ResolvedSigningRequest,
    Signature,
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
        this.metadata.description = `An unsecured wallet that can sign for authorities using the ${String(
            this.privateKey.toPublic()
        )} public key.`
    }
    async login(options: WalletPluginLoginOptions): Promise<WalletPluginLoginResponse> {
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
    async sign(chain: ChainDefinition, resolved: ResolvedSigningRequest): Promise<Signature> {
        const transaction = Transaction.from(resolved.transaction)
        const digest = transaction.signingDigest(Checksum256.from(chain.id))
        return this.privateKey.signDigest(digest)
    }
}
