"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __SYNDICATE__ = require("@syndicate-lang/core");
const core_1 = require("@syndicate-lang/core");
const WriterPresent = __SYNDICATE__.Record.makeConstructor()(Symbol.for("WriterPresent"), ["name"]);
// import { setTimeout as sleep } from 'node:timers/promises';
//   - Step 1: write a “hello world” program in Syndicate/TS.
// Create a shared local dataspace.
core_1.Dataspace.boot(ds => {
    // An actor that watches for string assertions.
    const actorFacets = new Map();
    setTimeout(() => pullPlug("writerOrigin"), 2000);
    __SYNDICATE__.Dataspace._spawn(() => {
        const currentSyndicateFacet = __SYNDICATE__.Turn.activeFacet;
        currentSyndicateFacet.actor.name = "reader";
        (((currentSyndicateTarget) => {
            let greeting = 'welcome';
            __SYNDICATE__.Turn.active.assertDataflow(() => ({ target: currentSyndicateTarget(), assertion: __SYNDICATE__.Observe({
                    pattern: __SYNDICATE__.QuasiValue.finish((__SYNDICATE__.QuasiValue.bind((__SYNDICATE__.QuasiValue._)))),
                    observer: __SYNDICATE__.Turn.ref({
                        assert: (__vs, __handle) => {
                            if (Array.isArray(__vs)) {
                                if (typeof (__vs[0]) !== "string")
                                    return;
                                const greeting = __vs[0];
                                console.log(greeting);
                            }
                        }
                    }),
                }) }));
        })(() => (ds)));
    });
    // experiment looping with spawns
    for (let i = 0; i < 5; i++) {
        __SYNDICATE__.Dataspace._spawn(() => {
            const currentSyndicateFacet = __SYNDICATE__.Turn.activeFacet;
            currentSyndicateFacet.actor.name = `writer ${i}`;
            (((currentSyndicateTarget) => {
                // i dont know if it'll explode so I'll innerscope
                let x = i;
                __SYNDICATE__.Turn.active.assertDataflow(() => ({ target: currentSyndicateTarget(), assertion: `Hello, world! I am spawn: ${x}` }));
            })(() => (ds)));
        });
    }
    // An actor that publishes a string assertion.
    __SYNDICATE__.Dataspace._spawn(() => {
        const currentSyndicateFacet = __SYNDICATE__.Turn.activeFacet;
        currentSyndicateFacet.actor.name = "writerOrigin";
        const writerFacet = core_1.Turn.activeFacet;
        actorFacets.set("writerOrigin", writerFacet);
        (((currentSyndicateTarget) => {
            __SYNDICATE__.Turn.active.assertDataflow(() => ({ target: currentSyndicateTarget(), assertion: WriterPresent("writerOrigin") }));
            __SYNDICATE__.Turn.active.assertDataflow(() => ({ target: currentSyndicateTarget(), assertion: "Hello, world!: I am the original spawn! " }));
        })(() => (ds)));
    });
    // a simple reader that listens and prints what is posted on the dataspace with an uncanny name
    __SYNDICATE__.Dataspace._spawn(() => {
        const currentSyndicateFacet = __SYNDICATE__.Turn.activeFacet;
        currentSyndicateFacet.actor.name = "parrotReader";
        // can be an array of subscriptions
        let subscribedReactTo = "writerOrigin";
        const readLine = __SYNDICATE__.Turn.active.field(null, "readLine");
        (((currentSyndicateTarget) => {
            __SYNDICATE__.Turn.active.assertDataflow(() => ({ target: currentSyndicateTarget(), assertion: __SYNDICATE__.Observe({
                    pattern: __SYNDICATE__.QuasiValue.finish((__SYNDICATE__.QuasiValue.bind((__SYNDICATE__.QuasiValue._)))),
                    observer: __SYNDICATE__.Turn.ref({
                        assert: (__vs, __handle) => {
                            if (Array.isArray(__vs)) {
                                if (typeof (__vs[0]) !== "string")
                                    return;
                                const line = __vs[0];
                                console.log("parrot read:", line);
                                readLine.value = line;
                            }
                        }
                    }),
                }) }));
            __SYNDICATE__.Turn.active.assertDataflow(() => (readLine.value !== null)
                ? ({ target: currentSyndicateTarget(), assertion: readLine.value })
                : ({ target: void 0, assertion: void 0 }));
            // simulate some reactive work based on missing origin actor / departure handler
            __SYNDICATE__.Turn.active.assertDataflow(() => ({ target: currentSyndicateTarget(), assertion: __SYNDICATE__.Observe({
                    pattern: __SYNDICATE__.QuasiValue.finish((__SYNDICATE__.QuasiValue.ctor(WriterPresent, (__SYNDICATE__.QuasiValue.litFromJS(subscribedReactTo))))),
                    observer: __SYNDICATE__.Turn.ref(__SYNDICATE__.assertionObserver((__vs) => {
                        if (Array.isArray(__vs)) {
                            return () => {
                                console.log("Parrot: writerOrigin has disconnected.");
                                // React by clearing the parrot's local memory.
                                readLine.value = null;
                                console.log("parrot read:", readLine.value);
                                // Do work one second after detecting departure.
                                core_1.Turn.active.after(1000, () => {
                                    console.log(`Parrot: doing some reactive work based on departure of: ${subscribedReactTo}`
                                    // stringify(fact) -- Todo: What does stringify do?
                                    );
                                });
                            };
                        }
                    })),
                }) }));
        })(() => (ds)));
        // at ds{
        //     on asserted $fact => {
        //     console.log("Parrot: current state of the whiteboard:", fact);
        //     }
        // }
    });
    // pull the plug function - pull the plug on a reader or writer, fiddling with retractions...
    function pullPlug(name) {
        const facet = actorFacets.get(name);
        if (!facet) {
            console.log("Actor not available:", name);
            return;
        }
        facet.turn(() => {
            core_1.Turn.active.stopActor();
        });
        actorFacets.delete(name);
    }
});
