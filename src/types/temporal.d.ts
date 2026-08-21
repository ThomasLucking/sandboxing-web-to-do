/**
 * Minimal ambient declaration for the native `Temporal` global.
 *
 * TypeScript's bundled lib types do not yet ship `Temporal` definitions.
 * This declares only the small subset of `Temporal.PlainDate` (and
 * `Temporal.Now`) actually used in this project, matching the real
 * TC39 Temporal proposal shape. It is not a polyfill — `Temporal` is
 * expected to exist as a native runtime global in supporting browsers.
 */
declare namespace Temporal {
  class PlainDate {
    private constructor()
    static from(item: string): PlainDate
    static compare(one: PlainDate, two: PlainDate): number
    toString(): string
  }

  namespace Now {
    function plainDateISO(): PlainDate
  }
}
