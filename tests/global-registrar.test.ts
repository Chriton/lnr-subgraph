// import {
//   assert,
//   describe,
//   test,
//   clearStore,
//   beforeAll,
//   afterAll
// } from "matchstick-as/assembly/index"
// import { Bytes, Address } from "@graphprotocol/graph-ts"
// import { ExampleEntity } from "../generated/schema"
// import { Changed } from "../generated/GlobalRegistrar/GlobalRegistrar"
// import { handleChanged } from "../src/global-registrar"
// import { createChangedEvent } from "./global-registrar-utils"
//
// // Tests structure (matchstick-as >=0.5.0)
// // https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0
//
// describe("Describe entity assertions", () => {
//   beforeAll(() => {
//     let name = Bytes.fromI32(1234567890)
//     let newChangedEvent = createChangedEvent(name)
//     handleChanged(newChangedEvent)
//   })
//
//   afterAll(() => {
//     clearStore()
//   })
//
//   // For more test scenarios, see:
//   // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test
//
//   test("ExampleEntity created and stored", () => {
//     assert.entityCount("ExampleEntity", 1)
//
//     // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
//     assert.fieldEquals(
//       "ExampleEntity",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
//       "name",
//       "1234567890"
//     )
//
//     // More assert options:
//     // https://thegraph.com/docs/en/developer/matchstick/#asserts
//   })
// })
