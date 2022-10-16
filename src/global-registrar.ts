import {Bytes, log} from "@graphprotocol/graph-ts"
import {
    GlobalRegistrar as LNRContract,
    Changed as ChangedEvent,
    PrimaryChanged as PrimaryChangedEvent
} from "../generated/GlobalRegistrar/GlobalRegistrar"
import {Domain, User} from "../generated/schema"

// ---------------- Event handlers ----------------

export function handleChanged(event: ChangedEvent): void {

    // Quick and dirty. I know ... ngmi
    let lnrContract = LNRContract.bind(event.address)

    let domainEntity = loadDomainEntity(event)
    let domain = event.params.name

    // ----------------------- Read the method used by its ID ---------------------------------
    // Reading the method
    // We could use callHandlers (eg. reserve(bytes32)) instead of eventHandlers
    // but then how do we know when the function failed?

    let method = event.transaction.input.toHexString()

    if (method.startsWith("0x432ced04")) {
        // log.info("reserve method detected: {}", [event.transaction.input.toHexString()])

        let domainOwner = lnrContract.owner(domain)
        domainEntity.owner = domainOwner.toHexString()
        domainEntity.domainBytecode = domain
        // Generates warnings:
        // Bytes contain invalid UTF8. This may be caused by attempting
        // to convert a value such as an address that cannot be parsed
        // to a unicode string. You may want to use 'toHexString()' instead.
        domainEntity.domainUtf8 = domain.toString()
        domainEntity.blockNumber = event.block.number
        domainEntity.reserveDate = event.block.timestamp
        domainEntity.reservedBy = event.address
        domainEntity.save()

        loadUserEntity(domainOwner)
    }

    if (method.startsWith("0x79ce9fac")) {
        // log.info("transfer method detected: {}", [event.transaction.input.toHexString()])

        let domainOwner = lnrContract.owner(domain)
        domainEntity.owner = domainOwner.toHexString()
        domainEntity.domainBytecode = domain
        // Generates warnings:
        // Bytes contain invalid UTF8. This may be caused by attempting
        // to convert a value such as an address that cannot be parsed
        // to a unicode string. You may want to use 'toHexString()' instead.
        domainEntity.domainUtf8 = domain.toString()
        domainEntity.blockNumber = event.block.number
        domainEntity.reserveDate = event.block.timestamp
        domainEntity.reservedBy = event.address
        domainEntity.save()

        loadUserEntity(domainOwner)
    }

    if (method.startsWith("0x89a69c0e")) {
        // log.info("setSubRegistrar method detected: {}", [event.transaction.input.toHexString()])

        let subRegistrar = lnrContract.subRegistrar(domain)
        domainEntity.subRegistrar = subRegistrar
        domainEntity.save()
    }

    if (method.startsWith("0xbe99a980")) {
        // log.info("setAddress method detected: {}", [event.transaction.input.toHexString()])

        let primary = lnrContract.addr(domain)
        domainEntity.primary = primary
        domainEntity.save()
    }

    if (method.startsWith("0xc3d014d6")) {
        // log.info("setContent method detected: {}", [event.transaction.input.toHexString()])

        let content = lnrContract.content(domain)
        domainEntity.content = content
        domainEntity.save()
    }

    if (method.startsWith("0xd93e7573")) {
        // log.info("disown method detected: {}", [event.transaction.input.toHexString()])

        let primary = lnrContract.addr(domain)
        domainEntity.primary = primary

        let domainOwner = lnrContract.owner(domain)
        domainEntity.owner = domainOwner.toHexString()
        domainEntity.save()

        loadUserEntity(domainOwner)
    }

}

// export function handlePrimaryChanged(event: PrimaryChanged): void {}

// ---------------- Function call handlers ----------------

// export function handleReserve(event: ChangedEvent): void {}

// export function handleTransfer(event: ChangedEvent): void {}
//
// export function handleDisown(event: ChangedEvent): void {}
//
// export function handleSetAddress(event: ChangedEvent): void {}
//
// export function handleSetSubRegistrar(event: ChangedEvent): void {}
//
// export function handleSetContent(event: ChangedEvent): void {}


// ---------------- Helpers ----------------

export function loadDomainEntity(event: ChangedEvent): Domain {

    let entity = Domain.load("id-".concat(event.params.name.toHexString()))

    if (!entity) {
        entity = new Domain("id-".concat(event.params.name.toHexString()))
    }
    return entity
}

export function loadUserEntity(address: Bytes): User {

    let entity = User.load(address.toHexString())

    if (!entity) {
        entity = new User(address.toHexString())
        entity.save()
    }

    return entity
}

