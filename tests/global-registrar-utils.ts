// import { newMockEvent } from "matchstick-as"
// import { ethereum, Bytes, Address } from "@graphprotocol/graph-ts"
// import {
//   Changed,
//   PrimaryChanged
// } from "../generated/GlobalRegistrar/GlobalRegistrar"
//
// export function createChangedEvent(name: Bytes): Changed {
//   let changedEvent = changetype<Changed>(newMockEvent())
//
//   changedEvent.parameters = new Array()
//
//   changedEvent.parameters.push(
//     new ethereum.EventParam("name", ethereum.Value.fromFixedBytes(name))
//   )
//
//   return changedEvent
// }
//
// export function createPrimaryChangedEvent(
//   name: Bytes,
//   addr: Address
// ): PrimaryChanged {
//   let primaryChangedEvent = changetype<PrimaryChanged>(newMockEvent())
//
//   primaryChangedEvent.parameters = new Array()
//
//   primaryChangedEvent.parameters.push(
//     new ethereum.EventParam("name", ethereum.Value.fromFixedBytes(name))
//   )
//   primaryChangedEvent.parameters.push(
//     new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
//   )
//
//   return primaryChangedEvent
// }
