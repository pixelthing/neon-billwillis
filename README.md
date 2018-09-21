# neon-billwillis

For a single promo page, this project might seem a little over-engineered, but for the amount of times I've started a single page that turned into a years long project, I figured it was better to start with a template of a component-lead project, instead of a simple flat page.

That does mean there's a little set-up involved if you want to make tweaks the to source components, instead of just pasting changes into the final code. So here's an explanation of the project structure.

- `/dist` & `/prod` are ready-to-roll compiled HTML/CSS/JS sites. **If you don't want to go any deeper, stop here**, because these are the site in it's final form. The only difference between them is that `/prod` code is almost all minified/compressed and production server ready, whereas `/dist` is a little more readable if you are wanting to debug stuff.
- `/src` is the project components broken down into small, easy to identify and update pieces. We then use `GULP` to compile and concatenate them into `/dist` and `/prod`.  I'll list out what is what in a moment.
- `/src-pages` is a file system of the pages that are created, alos in the `GULP` process. Think of it as a fake CMS, with `.mustache` files providing the file position in the file system (eg `/src-pages/index.mustache` is compiled to the url `/index.html`), and `.json` files are a description of the content (eg, use this component here, with that title and those images). `data.json` is also meta info that is inherited by all the pages.

# Start up GULP

This project uses Node, NPM and GULP to compile/build the components, start a local webserver and start a watch process, to give you a full front-end workflow for making changes to components, then seeing the result (then cursing and trying again).

To start from the beginning, checkout the project onto your computer. I've used this with _Node v6_-ish, but it should probably work with other versions if you're feeling brave (or use NVM to run v6). Do the dreaded:

```npm install```

...and after that on some environments I've also needed to do a:

```npm rebuild node-sass``` (only the first time you checkout the project)

...you should now be able to run:

```gulp``` 

...and it will compile the site into the `/dist` folder, start up a webserver and stay open, waiting for any changes to occur in the src files. You can see the site running at `http://localhost:3000`.

If you do `gulp prod` instead of `gulp`, it will compile and run the webserver from the `/prod` folder instead. The process and watchers might take a little longer to run (as it needs to do some extra steps in minimising code), but it's not a lot longer (in this size of project).

So - run GULP if you want to feel like a front-end hero, you can make changes in the src components (much easier than trying to do changes to the final code as the components are better isolated), and auto compile out to one of the two output folders. Like I said, it feels over-engineered for a single page, but once you try and build a version that's more than a few pages, it makes a lot of sense.

# Atomic design

The `/src` components are organised into: 
- `/src/base`: the basic settings, typography, colours, size variables, resets.
- `/src/elements`: the smallest components such as links, buttons, etc.
- `/src/modules`: bigger pieces of the puzzle. Think of them as bundling elements into a block of design that you might drag and drop into a page in a CMS. Most modules carry their own markup, CSS and JS files. The JS is usually compiled into the main JS, as is CSS - but `.output.scss` files are compiled seperately into their own file to use in a pattern where we link the styleheet further down the page (it helps with first paint perf).
- `/src/patterns`: over-arching rules that dictate how modules sit together (eg, the margins between sections).

Other stuff in the folder:
- `/src/partials`: parts of the HTML page broken out into generic parts (eg head, footer, stylesheets, typekit declarations).
- `/src/mixins`: small(er ?) javascript helpers and polyfills (eg, lazyload, object-fit)
- `/src/static`: where all the media sits (images, videos, icons). There's som JS in here that isn't used currently (or was only used in early dav phase).

# Media

- Most images use the `<picture>` tag so that we can present different file formats for platforms that can use them. Safari/iOS have `.jp2` JPEG2000 images, Chrome/FF has `.webp` WebP images, and the rest get `.jpg`. Some of the background images with alpha channels are 32bit PNGs that are pushed through a compressor to drop them down to 16/32/64 colours (a bit like a gif, but with better anti-aliasing and alpha channels).
- The header movie has a HEVC MP4 version of the movie for platforms that support it (mostly iOS), and an MP4 version for those that don't (which is twice the size - that HEVC is worth it). Small portrait screens get a portrait version of the video to make better use of the available pixels and keep the video sharp.
- There's an SVG icon system built in, but we don't really use much of it (just a couple of icons). If you drop an SVG into `/src/static/imgs/icons/sprites/`, the gulp process will automatically add it into the SVG spritesheet. It's magic. So drop an SVG called `chevron-right.svg` into the folder and you'll be able to use it your page like this:
```
<svg viewBox="0 0 512 512" class="Icon">
    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#chevron-right"></use>
</svg>
```

# Other points

- The CSS is compiled from SCSS sass files, and the CSS rules are constructed using BEM (base-element-modifier) pattern, but with pretty horrible casing (sorry, inherited from another project we didn't have control over). So the CSS classes look like: `.Base-Element-Element--modifier` (note the modifier is all lowercase).
- jQuery is not in the page. Neither is Angualr, react or other frameworks.
- Lots of JS is written in ES6 style, then compiled back to ES2015 with babel by gulp.
- The video element in the hero is killed if `Navigator.connection` detects a 2G/slow connection. This is a chrome-android only feature, but that's the target group.
- The video hero stops playing if it leaves the viewport and restarts when it returns, to reduce jank, pointless CPU cycles, heat and battery drain.
- The hero looks is iPhoneX ready, it plays in landscape full width, but the notch doesn't get in the way.
- Performance (especially first paint) was a major focus - lots of technical decisions hinged on it.