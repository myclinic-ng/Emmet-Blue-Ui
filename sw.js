importScripts('https://unpkg.com/workbox-sw@0.0.2/build/importScripts/workbox-sw.dev.v0.0.2.js');
importScripts('https://unpkg.com/workbox-runtime-caching@2.0.3/build/importScripts/workbox-runtime-caching.prod.v2.0.3.js');
importScripts('https://unpkg.com/workbox-routing@2.0.3/build/importScripts/workbox-routing.prod.v2.0.3.js');

const frontAssetRoute = new workbox.routing.RegExpRoute({
    regExp: new RegExp('assets/*'),
    handler: new workbox.runtimeCaching.CacheFirst()
});

const frontPluginsRoute = new workbox.routing.RegExpRoute({
    regExp: new RegExp('plugins/*'),
    handler: new workbox.runtimeCaching.CacheFirst()
});

const dynAssetRoute = new workbox.routing.RegExpRoute({
    regExp: new RegExp('^https://emmetblue.org.ng/v1/*'),
    handler: new workbox.runtimeCaching.NetworkFirst()
});

const backAssetRoute = new workbox.routing.RegExpRoute({
    regExp: new RegExp('^https://emmetblue.org.ng/bin/*'),
    handler: new workbox.runtimeCaching.CacheFirst()
});



const router = new workbox.routing.Router();
router.registerRoutes({routes: [frontAssetRoute, frontPluginsRoute, dynAssetRoute, backAssetRoute]});
router.setDefaultHandler({
    handler: new workbox.runtimeCaching.NetworkFirst()
});