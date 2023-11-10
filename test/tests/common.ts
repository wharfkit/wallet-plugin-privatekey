import {assert} from 'chai'
import {PermissionLevel, PrivateKey, SessionKit} from '@wharfkit/session'

import {WalletPluginPrivateKey} from '$lib'
import {mockFetch} from '$test/utils/mock-fetch'
import {MockStorage} from '$test/utils/mock-storage'
import {MockUserInterface} from '@wharfkit/mock-data'

const mockChainDefinition = {
    id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
    url: 'https://jungle4.greymass.com',
}

const mockPermissionLevel = PermissionLevel.from('wharfkit1115@test')

const mockPrivateKey = '5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s'

const mockSessionKitArgs = {
    appName: 'unittests',
    chains: [mockChainDefinition],
    ui: new MockUserInterface(),
    walletPlugins: [new WalletPluginPrivateKey(mockPrivateKey)],
}

const mockSessionKitOptions = {
    fetch: mockFetch, // Required for unit tests
}

suite('wallet plugin', function () {
    test('construct (typed)', function () {
        const wallet = new WalletPluginPrivateKey(PrivateKey.from(mockPrivateKey))
        assert.instanceOf(wallet, WalletPluginPrivateKey)
    })
    test('construct (untyped)', function () {
        const wallet = new WalletPluginPrivateKey(mockPrivateKey)
        assert.instanceOf(wallet, WalletPluginPrivateKey)
    })
    test('throws error with invalid privatekey', function () {
        assert.throws(() => {
            new WalletPluginPrivateKey('foo')
        }, Error)
    })
    test('login and sign', async function () {
        const kit = new SessionKit(mockSessionKitArgs, mockSessionKitOptions)
        const {session} = await kit.login({
            chain: mockChainDefinition.id,
            permissionLevel: mockPermissionLevel,
        })
        assert.isTrue(session.chain.equals(mockChainDefinition))
        assert.isTrue(session.actor.equals(mockPermissionLevel.actor))
        assert.isTrue(session.permission.equals(mockPermissionLevel.permission))
        const result = await session.transact(
            {
                action: {
                    authorization: [mockPermissionLevel],
                    account: 'eosio.token',
                    name: 'transfer',
                    data: {
                        from: mockPermissionLevel.actor,
                        to: 'wharfkittest',
                        quantity: '0.0001 EOS',
                        memo: 'wharfkit/session wallet plugin template',
                    },
                },
            },
            {
                broadcast: false,
            }
        )
        assert.isTrue(result.signer.equals(mockPermissionLevel))
        assert.equal(result.signatures.length, 1)
    })
    test('serializes properly', async function () {
        const kit = new SessionKit(mockSessionKitArgs, mockSessionKitOptions)
        const {session} = await kit.login({
            chain: mockChainDefinition.id,
            permissionLevel: mockPermissionLevel,
        })
        assert.deepEqual(session.serialize(), {
            chain: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
            actor: 'wharfkit1115',
            permission: 'test',
            walletPlugin: {
                id: 'wallet-plugin-privatekey',
                data: {
                    privateKey: 'PVT_K1_25XP1Lt1Rt87hyymouSieBbgnUEAerS1yQHi9wqHC2Uek2mgzH',
                },
            },
        })
    })
})
