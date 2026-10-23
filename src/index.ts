import { Dataspace, Turn, Facet, stringify } from "@syndicate-lang/core";
assertion type WriterPresent(name: string);
// import { setTimeout as sleep } from 'node:timers/promises';

//   - Step 1: write a “hello world” program in Syndicate/TS.


// Create a shared local dataspace.

Dataspace.boot(ds => {
    // An actor that watches for string assertions.
    const actorFacets = new Map<string, Facet>();
    setTimeout(() => pullPlug("writerOrigin"), 2000);
    spawn named "reader" {
        at ds {
            let greeting = 'welcome';
            on asserted $greeting: string => {
                console.log(greeting);
            }
        }
    }
    // experiment looping with spawns
    for (let i: number = 0; i<5; i++){
        spawn named `writer ${i}` {
            at ds {
                // i dont know if it'll explode so I'll innerscope
                let x = i;
                assert `Hello, world! I am spawn: ${x}`;
            }
    }
    }

    // An actor that publishes a string assertion.
    spawn named "writerOrigin" {
        const writerFacet = Turn.activeFacet;
        actorFacets.set("writerOrigin", writerFacet);
        at ds {
            assert WriterPresent("writerOrigin");
            assert "Hello, world!: I am the original spawn! ";
        }
    }

    // a simple reader that listens and prints what is posted on the dataspace with an uncanny name
    spawn named "parrotReader"{

        // can be an array of subscriptions
        let subscribedReactTo = "writerOrigin";

        field readLine: string  | null = null;
        at ds {

            on asserted $line: string => {
                console.log("parrot read:", line);
                readLine.value = line;
            }
            assert readLine.value when (readLine.value !== null);

            // simulate some reactive work based on missing origin actor / departure handler
            on retracted WriterPresent(subscribedReactTo) => {
                console.log("Parrot: writerOrigin has disconnected.");

                    // React by clearing the parrot's local memory.
                    readLine.value = null;
                    console.log("parrot read:", readLine.value);

                    // Do work one second after detecting departure.
                    Turn.active.after(1000, () => {
                                console.log(
                                    `Parrot: doing some reactive work based on departure of: ${subscribedReactTo}`
                                    // stringify(fact) -- Todo: What does stringify do?
                                );
                            
                    
                    });
                }
        }

        // at ds{
        //     on asserted $fact => {
        //     console.log("Parrot: current state of the whiteboard:", fact);

        //     }

        // }
    }

    // pull the plug function - pull the plug on a reader or writer, fiddling with retractions...
    function pullPlug(name: string) {
        const facet = actorFacets.get(name);

        if (!facet) {
            console.log("Actor not available:", name);
            return;
        }

        facet.turn(() => {
            Turn.active.stopActor();
        });

        actorFacets.delete(name);
    }
});