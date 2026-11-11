import assert from 'node:assert/strict'
import fs from 'node:fs'

const component = fs.readFileSync(new URL('../src/pages/student/StudentAssessments.jsx', import.meta.url), 'utf8')
const css = fs.readFileSync(new URL('../src/pages/student/StudentAssessments.css', import.meta.url), 'utf8')

assert.match(css, /\.assessment-video\{[^}]*aspect-ratio:16\/9/)
assert.match(css, /@media\(max-width:540px\)[\s\S]*\.assessment-intro-video \.assessment-video-shell\{[^}]*aspect-ratio:9\/16/)
assert.match(component, /assessment-video-expand/)
assert.match(component, /assessment-video-lightbox/)
assert.match(component, /assessment-video-copy/)
assert.match(css, /\.assessment-video-copy\{[^}]*linear-gradient/)
assert.match(component, /assessment-video-cover\.png/)
assert.match(component, /Como fazer a avaliação/)
assert.match(css, /assessment-video-cover-foreground\{[^}]*object-fit:contain/)
assert.match(css, /assessment-video-expanded iframe\{[^}]*width:316%/)
assert.match(component, /allowFullScreen/)
assert.match(component, /aria-modal="true"/)

console.log('assessment orientation video is horizontal on desktop, vertical on mobile and expandable')
