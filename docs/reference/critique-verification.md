# Critique and verification

## Use the loop

For every page or major component:

1. Plan the content job and visual hierarchy.
2. Build the smallest complete version.
3. Render at required viewports.
4. Inspect interaction and console state.
5. Critique against brand, originality, conversion, accessibility, and performance.
6. Refine the highest-severity issue.
7. Repeat until no high-severity issue remains.

## Critique questions

### Brand

- Could this belong to another company after a logo swap?
- Is the motif present without becoming repetitive?
- Are colour and typography roles consistent?

### Composition

- Is one element dominant in each viewport?
- Does the page rhythm vary without losing coherence?
- Are cards used because the content is object-like?
- Do whitespace and alignment guide attention?

### Content and conversion

- Is the promise specific?
- Is proof close to the claim?
- Is the primary action obvious?
- Are there invented or unsupported claims?

### Interaction

- Does every motion have a job?
- Can motion be interrupted?
- Are focus, active, loading, error, and success states complete?
- Does reduced motion preserve meaning?

### Responsive and accessible

- Does mobile feel composed rather than collapsed?
- Are line breaks, reading measure, crops, and touch targets sound?
- Can the page be used by keyboard and assistive technology?

### Performance

- Are core content and conversion server-rendered?
- Is layout stable before media loads?
- Are image, font, JavaScript, and WebGL costs proportionate?
- Are there browser console errors or failed requests?

## Severity

- High: blocks understanding, conversion, navigation, accessibility, static output, or runtime stability.
- Medium: weakens hierarchy, brand coherence, responsiveness, or performance.
- Low: polish issue with no meaningful usability impact.

Fix high-severity issues before broadening scope. Do not spend iteration time polishing a weak direction.

## Delivery evidence

Report:

- pages and components verified;
- viewport sizes;
- automated commands and exit status;
- browser console status;
- reduced-motion result;
- remaining limitations;
- exact artifact or commit location.
