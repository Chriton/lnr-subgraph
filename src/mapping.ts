import {Bytes, Address, ethereum, store, log, json, TypedMap} from "@graphprotocol/graph-ts"
import {GlobalRegistrar as LNRContract, Changed} from "../generated/GlobalRegistrar/GlobalRegistrar"
import {Transfer, Wrapped, Unwrapped, LinageeWrapper} from "../generated/LinageeWrapped/LinageeWrapper";

import {
    isReserveMethod, isTransferMethod, isSetSubRegistrar,
    isSetAddress, isSetContentMethod, isDisownMethod,
    loadDomainEntity, loadWrappedDomainEntity, loadUserEntity,
    NULL_ADDRESS, loadStatsEntity
} from './helpers'

// -------------------------------- Start Event handlers --------------------------------

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
export function handleChanged(event: Changed): void {

    // Quick and dirty. I know ... ngmi
    let lnrContract = LNRContract.bind(event.address)
    let domainEntity = loadDomainEntity(event.params.name.toHexString())
    let domain = event.params.name

    // Reading the methodID that was used
    let methodID = event.transaction.input.toHexString().substring(0, 10);

    if (isReserveMethod(methodID)) {
        let domainOwner = lnrContract.owner(domain)
        loadUserEntity(domainOwner)

        domainEntity.owner = domainOwner.toHexString()
        domainEntity.domainBytecode = domain
        // Generates subgraph warning: Bytes contain invalid UTF8...You may want to use 'toHexString()' instead
        domainEntity.domainUtf8 = domain.toString()

        domainEntity.blockNumber = event.block.number
        domainEntity.reserveDate = event.block.timestamp

        domainEntity.wrapped = false;
        domainEntity.wrappedDomainOwner = NULL_ADDRESS;

        domainEntity.save()
    }

    else if (isTransferMethod(methodID)) {
        let domainOwner = lnrContract.owner(domain)
        loadUserEntity(domainOwner)

        domainEntity.owner = domainOwner.toHexString()
        domainEntity.domainBytecode = domain
        // Generates subgraph warning: Bytes contain invalid UTF8...You may want to use 'toHexString()' instead
        domainEntity.domainUtf8 = domain.toString()

        domainEntity.blockNumber = event.block.number
        domainEntity.reserveDate = event.block.timestamp

        domainEntity.save()
    }

    else if (isSetSubRegistrar(methodID)) {
        domainEntity.subRegistrar = lnrContract.subRegistrar(domain)
        domainEntity.save()
    }

    else if (isSetAddress(methodID)) {
        domainEntity.primary = lnrContract.addr(domain)
        domainEntity.save()
    }

    else if (isSetContentMethod(methodID)) {
        domainEntity.content = lnrContract.content(domain)
        domainEntity.save()
    }

    else if (isDisownMethod(methodID)) {
        domainEntity.primary = lnrContract.addr(domain)
        let domainOwner = lnrContract.owner(domain)

        loadUserEntity(domainOwner)

        domainEntity.owner = domainOwner.toHexString()
        domainEntity.subRegistrar = lnrContract.subRegistrar(domain)
        domainEntity.wrapped = false;

        domainEntity.save()
    } else {
        log.debug("MethodId used: '{}' param.name = '{}' Domain = '{}' Transaction hash = '{}'",
            [methodID,
            event.params.name.toHexString(),
            event.params.name.toString(),
            event.transaction.hash.toHexString()
            ])

        let domainOwner = lnrContract.owner(domain)
        loadUserEntity(domainOwner)

        domainEntity.owner = domainOwner.toHexString()
        domainEntity.domainBytecode = domain
        // Generates subgraph warning: Bytes contain invalid UTF8...You may want to use 'toHexString()' instead
        domainEntity.domainUtf8 = domain.toString()

        domainEntity.blockNumber = event.block.number
        domainEntity.reserveDate = event.block.timestamp

        domainEntity.wrapped = false;
        domainEntity.wrappedDomainOwner = NULL_ADDRESS;

        domainEntity.save()
    }


    // -------------------------------- Tests / Investigations --------------------------

    // https://www.edureka.co/community/22203/ethereum-call-contract-method-emits-event-another-contract
    // get methodID and address that sent the transaction
    // const receipt = event.receipt

    // ethereum.TransactionReceipt.name
    // ethereum.Transaction.name
    // ethereum.Log.name

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
    //     log.debug("numberOfLogs={}", [numberOfLogs.toString()])
    //
    //     for (let logIndex = 0; logIndex < numberOfLogs; logIndex++) {
    //         const numberOfTopics = receipt.logs[logIndex].topics.length
    //         for (let topicIndex = 0; topicIndex < numberOfTopics; topicIndex++) {
    //             log.debug("Log-{} of {} Topic-{} of {} Data = '{}'",
    //                 [logIndex.toString(), numberOfLogs.toString(),
    //                     topicIndex.toString(), numberOfTopics.toString(),
    //                     receipt.logs[logIndex].topics[topicIndex].toHexString()])
    //         }
    //     }
    // }

}

/**
 * The original linagee token will now be owned by the wrapper contract
 * The new wrapped token will be owned by the user
 * This event happens on the wrapper contract
 * @param event
 */
export function handleWrapped(event: Wrapped): void {
    // pairId, owner, namer

    loadUserEntity(event.params.owner)

    // Set the owner, wrapped and wrappedDomainOwner (on the Domain entity)
    let domainEntity = loadDomainEntity(event.params.namer.toHexString())
    // domainEntity.owner = event.params.owner.toHexString()
    // should be the wrapper address - check it!
    domainEntity.owner = event.address.toHexString()

    // should we create a new blockNumberWrapped for this?
    domainEntity.blockNumber = event.block.number
    // also for this?
    domainEntity.reserveDate = event.block.timestamp

    domainEntity.wrapped = true
    domainEntity.wrappedDomainOwner = event.params.owner.toHexString()
    domainEntity.save();

    // Set the owner and domain (on the WrappedDomain entity)
    let wrappedDomainEntity = loadWrappedDomainEntity(event.params.pairId.toString())
    wrappedDomainEntity.owner = event.params.owner.toHexString()
    wrappedDomainEntity.domain = domainEntity.id
    wrappedDomainEntity.save()

    // Update the total wrapped tokens number
    let stats = loadStatsEntity();
    stats.totalWraps = stats.totalWraps + 1;
    stats.save();
}

/**
 * Update the data in the Domain and WrappedDomain entities regarding ownership
 * This event happens on the wrapper contract
 *
 * @param event
 */
export function handleTransfer(event: Transfer): void {
    // from, to, tokenId

    // use try catch? so that the subgraph continues and not crash the entire thing when something happens

    // Should be before or after the Domain entity??
    loadUserEntity(event.params.to)
    loadUserEntity(event.params.from)

    // Set the owner and wrappedDomainOwner (on the Domain entity)
    let wrapperContract = LinageeWrapper.bind(event.address)
    let domain = wrapperContract.idToName(event.params.tokenId)
    let domainEntity = loadDomainEntity(domain.toHexString())

    domainEntity.owner = event.params.to.toHexString()
    domainEntity.wrappedDomainOwner = event.params.to.toHexString()

    // if (!domainEntity.blockNumber) {
    //     domainEntity.blockNumber = event.block.number
    // }
    // if (!domainEntity.reserveDate) {
    //     domainEntity.reserveDate = event.block.timestamp
    // }

    domainEntity.save()

    // Set the owner and domain (on the WrappedDomain entity)
    let wrappedDomainEntity = loadWrappedDomainEntity(event.params.tokenId.toString())
    wrappedDomainEntity.owner = event.params.to.toHexString()
    wrappedDomainEntity.domain = domainEntity.id
    wrappedDomainEntity.save();
}

/**
 * The original linagee token will now be owned by the user again (wrapper contract had it before)
 * The wrapped token will be burned and so the owner will be the null address
 * This event happens on the wrapper contract
 * @param event
 */
export function handleUnwrapped(event: Unwrapped): void {
    // pairId, owner, namer

    // Should be before or after the Domain entity??
    loadUserEntity(event.params.owner)

    // Set the new owner, wrapped and wrappedDomainOwner (on the Domain entity)
    let domainEntity = loadDomainEntity(event.params.namer.toHexString())
    domainEntity.owner = event.params.owner.toHexString()
    domainEntity.wrapped = false
    domainEntity.wrappedDomainOwner = NULL_ADDRESS
    domainEntity.save()

    // Set the owner to the null address (on the WrappedDomain entity)
    let wrappedDomainEntity = loadWrappedDomainEntity(event.params.pairId.toString())
    wrappedDomainEntity.owner =  NULL_ADDRESS
    wrappedDomainEntity.save();

    // Update the total wrapped tokens number
    let stats = loadStatsEntity();
    stats.totalWraps = stats.totalWraps - 1;
    stats.save();
}

// -------------------------------- End Event handlers ----------------------------------
