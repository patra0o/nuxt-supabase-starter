// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: 'Tulongeni',
			htmlAttrs: {
				lang: 'en',
			},
			meta: [
				{
					hid: 'description',
					name: 'description',
					content:
						'Nuxt and Supabase Starer to help you kickstart your next project.',
				},
				{ hid: 'og:image', name: 'og:image', content: '/og-image.png' },
			],
			link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
		},
	},
	devtools: { enabled: true },
	// extends: '@nuxt-themes/docus',
	ui: {
		icons: ['lucide'],
		
	},
	supabase: {
		redirect: false,
	},
	runtimeConfig: {
		GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
		public: {
			APP_URL: process.env.APP_URL,
			
		},
	},
	modules: [
		'@nuxt/ui',
		'nuxt-icon',
		'@nuxtjs/color-mode',
		'@vueuse/nuxt',
		'@nuxtjs/supabase',
		'@nuxt/content',
	],
	content: {
		contentHead: true,
	},
})
