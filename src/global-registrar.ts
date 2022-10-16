import {Bytes} from "@graphprotocol/graph-ts"
import {
    GlobalRegistrar,
    Changed,
    PrimaryChanged
} from "../generated/GlobalRegistrar/GlobalRegistrar"
import {Domain, User} from "../generated/schema"

// ---------------- Event handlers ----------------

export function handleChanged(event: Changed): void {

    // Quick and dirty. I know ... ngmi
    let contract = GlobalRegistrar.bind(event.address)

    let domainEntity = loadDomainEntity(event)
    let domain = event.params.name
    let primary = contract.addr(event.params.name)
    let subRegistrar = contract.subRegistrar(event.params.name)
    let content = contract.content(event.params.name)

    // if (owner.toHexString() != '0x0000000000000000000000000000000000000000') {
        //domainEntity.owner = user.
    // }

    // if (domain.toHexString() != '0x0000000000000000000000000000000000000000000000000000000000000000') {
        domainEntity.domainBytecode = domain
        domainEntity.domainUtf8 = domain.toString()
    // }

    // if (primary.toHexString() != '0x0000000000000000000000000000000000000000') {
    //     domainEntity.primary = primary
    // }

    // if (subRegistrar.toHexString() != '0x0000000000000000000000000000000000000000') {
    //     domainEntity.subRegistrar = subRegistrar
    // }

    // if (content.toHexString() != '0x0000000000000000000000000000000000000000000000000000000000000000') {
    //     domainEntity.content = content
    // }

    domainEntity.owner = contract.owner(event.params.name).toHexString()
    domainEntity.save()
    loadUserEntity(contract.owner(event.params.name))
}

// export function handlePrimaryChanged(event: PrimaryChanged): void {}

// ---------------- Function call handlers ----------------

// export function handleReserve(event: Changed): void {
    // let domainEntity = loadDomainEntity(event)

    // domainEntity.registeredTimestamp = event.block.timestamp
    // domainEntity.registeredBlock = event.block.number
// }

// export function handleTransfer(event: Changed): void {}
//
// export function handleDisown(event: Changed): void {}
//
// export function handleSetAddress(event: Changed): void {}
//
// export function handleSetSubRegistrar(event: Changed): void {}
//
// export function handleSetContent(event: Changed): void {}


// ---------------- Helpers ----------------

export function loadDomainEntity(event: Changed): Domain {
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
