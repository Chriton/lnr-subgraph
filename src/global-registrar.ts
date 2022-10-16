import {Bytes} from "@graphprotocol/graph-ts"
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

    // time expensive
    let primary = lnrContract.addr(event.params.name)
    let subRegistrar = lnrContract.subRegistrar(event.params.name)
    let content = lnrContract.content(event.params.name)
    let owner = lnrContract.owner(event.params.name)

    // if (domain.toHexString() != '0x0000000000000000000000000000000000000000000000000000000000000000') {
        domainEntity.domainBytecode = domain
        domainEntity.domainUtf8 = domain.toString()
    // }

    // if (primary.toHexString() != '0x0000000000000000000000000000000000000000') {
        domainEntity.primary = primary
    // }

    // if (subRegistrar.toHexString() != '0x0000000000000000000000000000000000000000') {
        domainEntity.subRegistrar = subRegistrar
    // }

    // if (content.toHexString() != '0x0000000000000000000000000000000000000000000000000000000000000000') {
        domainEntity.content = content
    // }

    domainEntity.owner = owner.toHexString()
    domainEntity.save()
    loadUserEntity(owner)
}

// export function handlePrimaryChanged(event: PrimaryChanged): void {}

// ---------------- Function call handlers ----------------

// export function handleReserve(event: ChangedEvent): void {
    // let domainEntity = loadDomainEntity(event)

    // domainEntity.registeredTimestamp = event.block.timestamp
    // domainEntity.registeredBlock = event.block.number
// }

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
    // use toHex() instead of toHexString() ?
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
