/* transform/filter/backdrop-filter/will-change/contain on a pin ancestor creates a containing block, silently breaking the fixed pin. Dev-only assertion. */

const CONTAINING_BLOCK_PROPS = ['transform', 'filter', 'backdropFilter', 'perspective', 'contain', 'willChange'] as const

const NEUTRAL_VALUES = ['none', 'normal', 'auto', ''] as const

const isNeutral = (value: string): boolean => NEUTRAL_VALUES.includes(value as (typeof NEUTRAL_VALUES)[number])

/**
 * Walks up from a to-be-pinned element and warns about any ancestor that would break
 * fixed positioning. Dev only: call sites guard on `import.meta.env.DEV`.
 */
export const checkPinParents = (element: Element): void => {
  let parent = element.parentElement

  while (parent) {
    const styles = getComputedStyle(parent)
    const broken = CONTAINING_BLOCK_PROPS.filter(prop => !isNeutral(styles[prop]))

    if (broken.length > 0) {
      console.warn(
        `[motion] ${parent.tagName.toLowerCase()}${parent.id ? `#${parent.id}` : ''} sets ${broken.join(', ')}, ` +
          'which creates a containing block and breaks ScrollTrigger pinning. See base.css.',
        parent,
      )
    }

    parent = parent.parentElement
  }
}
