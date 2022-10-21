import {TypedMap} from "@graphprotocol/graph-ts/index";
import {Domain, User, WrappedDomain} from "../generated/schema";
import {Bytes, Address} from "@graphprotocol/graph-ts";

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const MethodID = new TypedMap<string, string>();

// Original linagee contract: 0x5564886ca2c518d1964e5fcea4f423b41db9f561
MethodID.set('reserve', '0x432ced04')
MethodID.set('transfer', '0x79ce9fac')
MethodID.set('setSubRegistrar', '0x89a69c0e')
MethodID.set('setAddress', '0xbe99a980')
MethodID.set('setContent', '0xc3d014d6')
MethodID.set('disown', '0xd93e7573')

// Linagee.tools: 0x68fc0c4eb5fee9f240238d925bbc3ffe624a68ff / 0x72c30b3e3b1526a24b757f5dc1dc1f4a6a8d4edb
MethodID.set('bulkReserve', '0x62a52fff')
MethodID.set('bulkReserveAndMintErc721', '0x71ec7785')
MethodID.set('bulkMintToERC721', '0xa4c6bc7b')
MethodID.set('reserveAndMintErc721', '0xf3461a7b')

/**
 * Checks if the methodID provided is the 'reserve' method or one that uses 'reserve' method
 *
 * @param methodID the methodID
 */
export function isReserveMethod(methodID: string): boolean {
    // log.info("reserve method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == MethodID.get('reserve') || methodID == MethodID.get('bulkReserve'));
}

/**
 * Checks if the methodID provided is the 'transfer' method or one that uses 'transfer' method
 *
 * @param methodID the methodID
 */
export function isTransferMethod(methodID: string): boolean {
    // log.info("transfer method detected: {}", [event.transaction.input.toHexString()])
    return (
        methodID == MethodID.get('transfer')                  ||
        methodID == MethodID.get('bulkReserveAndMintErc721')  ||
        methodID == MethodID.get('reserveAndMintErc721')      ||
        methodID == MethodID.get('bulkMintToERC721')
    )
}

/**
 * Checks if the methodID provided is the 'setSubRegistrar' method
 *
 * 0x89a69c0e = 'setSubRegistrar' method from the original linagee contract
 *
 * linagee contract = 0x5564886ca2c518d1964e5fcea4f423b41db9f561
 *
 * @param methodID
 */
export function isSetSubRegistrar(methodID: string): boolean {
    // log.info("setSubRegistrar method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == MethodID.get('setSubRegistrar'))
}

/**
 * Checks if the methodID provided is the 'setAddress' method
 *
 * 0xbe99a980 = 'setAddress' method from the original linagee contract
 *
 * linagee contract = 0x5564886ca2c518d1964e5fcea4f423b41db9f561
 *
 * @param methodID
 */
export function isSetAddress(methodID: string): boolean {
    // log.info("setAddress method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == MethodID.get('setAddress'))
}

/**
 * Checks if the methodID provided is the 'setContent' method
 *
 * 0xc3d014d6 = 'setContent' method from the original linagee contract
 *
 * linagee contract = 0x5564886ca2c518d1964e5fcea4f423b41db9f561
 *
 * @param methodID
 */
export function isSetContentMethod(methodID: string): boolean {
    // log.info("setContent method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == MethodID.get('setContent'))
}

/**
 * Checks if the methodID provided is the 'disown' method
 *
 * 0xd93e7573 = 'disown' method from the original linagee contract
 *
 * linagee contract = 0x5564886ca2c518d1964e5fcea4f423b41db9f561
 *
 * @param methodID
 */
export function isDisownMethod(methodID: string): boolean {
    // log.info("disown method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == MethodID.get('disown'))
}

export function loadDomainEntity(name: string): Domain {

    let entity = Domain.load("id-".concat(name))

    if (!entity) {
        entity = new Domain("id-".concat(name))
    }
    return entity
}

export function loadWrappedDomainEntity(tokenId: string): WrappedDomain {

    let entity = WrappedDomain.load(tokenId)

    if (!entity) {
        entity = new WrappedDomain(tokenId)
    }
    return entity
}

export function loadUserEntity(address: Bytes): User {

    let entity = User.load(address.toHexString())

    if (!entity) {
        entity = new User(address.toHexString())
        entity.address = Address.fromBytes(address)
        entity.save()
    }

    return entity
}
