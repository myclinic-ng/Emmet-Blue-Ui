module.exports = {
	globDirectory: 'app/',
	globPatterns: [
		'**/*.{js,json,html,css,eot,svg,ttf,woff,woff2,otf,gif,png,xml,ico,webmanifest,jpg,zip,db,md,swf,xap,sh,as,txt,fla}'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'app/sw.js'
};