import {Bytes, log} from "@graphprotocol/graph-ts"
import {
    GlobalRegistrar as LNRContract,
    Changed as ChangedEvent,

} from "../generated/GlobalRegistrar/GlobalRegistrar"
import {Domain, User} from "../generated/schema"

// ---------------- Event handlers ----------------

/**
 * This event gets triggered for ALL the actions we do in the original Linagee contract.
 *
 * When this event gets triggered the action had already happened (reserve, transfer, etc.)
 * so we might as well read the owner, address, content, etc. from the contract itself who
 * is the ultimate provider for the data we are interested in.
 * Disadvantage: the subgraph will index more slowly
 *
 * We could use callHandlers (eg. reserve(bytes32)) instead of eventHandlers,
 * but then we don't know when the function failed. On the other hand the
 * Changed event only get triggered when the function has succeeded.
 */
export function handleChanged(event: ChangedEvent): void {

    // Quick and dirty. I know ... ngmi
    let lnrContract = LNRContract.bind(event.address)
    let domainEntity = loadDomainEntity(event)
    let domain = event.params.name

    // ----------------------- Reading the methodID that was used ---------------------------------

    let methodID = event.transaction.input.toHexString().substring(0, 10);

    if (isReserveMethod(methodID)) {
        let domainOwner = lnrContract.owner(domain)

        domainEntity.owner = domainOwner.toHexString()
        domainEntity.domainBytecode = domain
        // Generates subgraph warning: Bytes contain invalid UTF8...You may want to use 'toHexString()' instead
        domainEntity.domainUtf8 = domain.toString()

        domainEntity.blockNumber = event.block.number
        domainEntity.reserveDate = event.block.timestamp

        domainEntity.save()

        loadUserEntity(domainOwner)
    }

    if (isTransferMethod(methodID)) {
        let domainOwner = lnrContract.owner(domain)

        domainEntity.owner = domainOwner.toHexString()
        domainEntity.domainBytecode = domain
        // Generates subgraph warning: Bytes contain invalid UTF8...You may want to use 'toHexString()' instead
        domainEntity.domainUtf8 = domain.toString()

        domainEntity.blockNumber = event.block.number
        domainEntity.reserveDate = event.block.timestamp

        domainEntity.save()

        loadUserEntity(domainOwner)
    }

    if (isSetSubRegistrar(methodID)) {
        domainEntity.subRegistrar = lnrContract.subRegistrar(domain)
        domainEntity.save()
    }

    if (isSetAddress(methodID)) {
        domainEntity.primary =  lnrContract.addr(domain)
        domainEntity.save()
    }

    if (isSetContentMethod(methodID)) {
        domainEntity.content = lnrContract.content(domain)
        domainEntity.save()
    }

    if (isDisownMethod(methodID)) {
        domainEntity.primary = lnrContract.addr(domain)

        let domainOwner = lnrContract.owner(domain)
        domainEntity.owner = domainOwner.toHexString()
        domainEntity.save()

        loadUserEntity(domainOwner)
    }


    // ----------------------- Tests / Investigations ---------------------------------

    // https://www.edureka.co/community/22203/ethereum-call-contract-method-emits-event-another-contract
    // get methodID and address that sent the transaction
    // const receipt = event.receipt

    // if (receipt) {
    //     const data = receipt.logs[index].data;
    //     const decoded = ethereum.decode("(uint256,address,uint256,uint256,uint256)", data)
    //     const tuple = decoded!.toTuple();
    // }

    // structure-of-a-transaction-receipt
    // https://ethereum.stackexchange.com/questions/6531/structure-of-a-transaction-receipt

    // if (receipt) {
    //     // const data = receipt.logs[0].data;
    //
    //     const numberOfLogs = receipt.logs.length
    //     const blockNumber = receipt.blockNumber
    //
    //     log.error("numberOfLogs={}", [numberOfLogs.toString()])
    //
    //     for (let logIndex = 0; logIndex < numberOfLogs; logIndex++) {
    //         const numberOfTopics = receipt.logs[logIndex].topics.length
    //         for (let topicIndex = 0; topicIndex < numberOfTopics; topicIndex++) {
    //             log.error("Log-{} of {} Topic-{} of {} Data = '{}'",
    //                 [logIndex.toString(), numberOfLogs.toString(),
    //                     topicIndex.toString(), numberOfTopics.toString(),
    //                     receipt.logs[logIndex].topics[topicIndex].toHexString()])
    //         }
    //     }
    // }

}

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

/**
 * Checks if the methodID provided is the 'reserve' method or one that uses 'reserve' method
 *
 * 0x432ced04 = 'reserve' method from the original linagee contract (0x5564886ca2c518d1964e5fcea4f423b41db9f561)
 * 0x62a52fff = 'bulkReserve' from linagee.tools contract (0x68fc0c4eb5fee9f240238d925bbc3ffe624a68ff)
 *
 * linagee.tools contract methodIDs are the same for 0x68fc0c4eb5fee9f240238d925bbc3ffe624a68ff (new one) and
 * 0x72c30b3e3b1526a24b757f5dc1dc1f4a6a8d4edb (old one)
 *
 * @param methodID the methodID
 */
export function isReserveMethod(methodID: string): boolean {
    // log.info("reserve method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == '0x432ced04' || methodID == '0x62a52fff');
}

/**
 * Checks if the methodID provided is the 'transfer' method or one that uses 'transfer' method
 *
 * 0x79ce9fac = 'transfer' method from the original linagee contract (0x5564886ca2c518d1964e5fcea4f423b41db9f561)
 * 0x71ec7785 = 'bulkReserveAndMintErc721' from linagee.tools contract (0x68fc0c4eb5fee9f240238d925bbc3ffe624a68ff)
 * 0xf3461a7b = 'reserveAndMintErc721' from linagee.tools contract (0x68fc0c4eb5fee9f240238d925bbc3ffe624a68ff)
 * 0xa4c6bc7b = 'bulkMintToERC721' from linagee.tools contract (0x68fc0c4eb5fee9f240238d925bbc3ffe624a68ff)
 *
 * linagee.tools contract methodIDs are the same for 0x68fc0c4eb5fee9f240238d925bbc3ffe624a68ff (new one) and
 * 0x72c30b3e3b1526a24b757f5dc1dc1f4a6a8d4edb (old one)
 * @param methodID the methodID
 */
export function isTransferMethod(methodID: string): boolean {
    // log.info("transfer method detected: {}", [event.transaction.input.toHexString()])
    return (
        methodID == '0x79ce9fac' ||
        methodID == '0x71ec7785' ||
        methodID == '0xf3461a7b' ||
        methodID == '0xa4c6bc7b'
    )
}

/**
 * Checks if the methodID provided is the 'setSubRegistrar' method
 *
 * 0x89a69c0e = 'setSubRegistrar' method from the original linagee contract (0x5564886ca2c518d1964e5fcea4f423b41db9f561)
 *
 * @param methodID
 */
export function isSetSubRegistrar(methodID: string): boolean {
    // log.info("setSubRegistrar method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == '0x89a69c0e')
}

/**
 * Checks if the methodID provided is the 'setAddress' method
 *
 * 0xbe99a980 = 'setAddress' method from the original linagee contract (0x5564886ca2c518d1964e5fcea4f423b41db9f561)
 *
 * @param methodID
 */
export function isSetAddress(methodID: string): boolean {
    // log.info("setAddress method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == '0xbe99a980')
}

/**
 * Checks if the methodID provided is the 'setContent' method
 *
 * 0xc3d014d6 = 'setContent' method from the original linagee contract (0x5564886ca2c518d1964e5fcea4f423b41db9f561)
 *
 * @param methodID
 */
export function isSetContentMethod(methodID: string): boolean {
    // log.info("setContent method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == '0xc3d014d6')
}

/**
 * Checks if the methodID provided is the 'disown' method
 *
 * 0xd93e7573 = 'disown' method from the original linagee contract (0x5564886ca2c518d1964e5fcea4f423b41db9f561)
 *
 * @param methodID
 */
export function isDisownMethod(methodID: string): boolean {
    // log.info("disown method detected: {}", [event.transaction.input.toHexString()])
    return (methodID == '0xd93e7573')
}
