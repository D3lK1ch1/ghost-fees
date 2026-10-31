/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			retro: ['var(--font-retro)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
  				'50%': { transform: 'translateY(-10px) rotate(1.5deg)' }
  			},
  			rise: {
  				from: { opacity: '0', transform: 'translateY(14px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'scan-beam': {
  				'0%': { transform: 'translateX(-140%)' },
  				'100%': { transform: 'translateX(440%)' }
  			},
  			'ghost-sweep': {
  				to: { left: '110%' }
  			},
  			'ghost-fill': {
  				to: { width: '100%' }
  			},
  			'ghost-card': {
  				from: { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
  				to: { opacity: '1', transform: 'none' }
  			},
  			'ghost-pop': {
  				'0%': { opacity: '0', transform: 'scale(0.6)' },
  				'60%': { opacity: '1', transform: 'scale(1.15)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			},
  			bob: {
  				'0%, 100%': { transform: 'translateY(0) rotate(0)' },
  				'25%': { transform: 'translateY(-6px) rotate(-2deg)' },
  				'50%': { transform: 'translateY(-10px) rotate(0)' },
  				'75%': { transform: 'translateY(-6px) rotate(2deg)' }
  			},
  			'ghost-suck': {
  				from: { transform: 'translate(var(--sx), var(--sy))' },
  				to: { transform: 'translate(0, 0) scale(0.3)', opacity: '0' }
  			},
  			'ghost-jar': {
  				'0%': { transform: 'scale(0.9)' },
  				'60%': { transform: 'scale(1.08)' },
  				'100%': { transform: 'scale(1)' }
  			},
  			seance: {
  				'0%, 100%': { transform: 'translate(-34px, 10px) rotate(-4deg)' },
  				'25%': { transform: 'translate(-4px, -12px) rotate(3deg)' },
  				'50%': { transform: 'translate(28px, 4px) rotate(-2deg)' },
  				'75%': { transform: 'translate(2px, 16px) rotate(5deg)' }
  			},
  			flicker: {
  				'0%, 100%': { opacity: '1', transform: 'scale(1)' },
  				'50%': { opacity: '0.6', transform: 'scale(0.9)' }
  			},
  			'window-flicker': {
  				'0%, 18%, 22%, 60%, 64%, 100%': { opacity: '1' },
  				'20%, 62%': { opacity: '0.35' }
  			},
  			'fog-drift': {
  				'0%, 100%': { transform: 'translateX(-6%)' },
  				'50%': { transform: 'translateX(6%)' }
  			},
  			'bat-fly': {
  				'0%': { transform: 'translate(-40px, 30px) scale(0.8)', opacity: '0' },
  				'10%': { opacity: '1' },
  				'50%': { transform: 'translate(45vw, -10px) scale(1)' },
  				'90%': { opacity: '1' },
  				'100%': { transform: 'translate(90vw, 20px) scale(0.8)', opacity: '0' }
  			},
  			'moon-glow': {
  				'0%, 100%': { boxShadow: '0 0 50px rgba(245,239,224,0.35)' },
  				'50%': { boxShadow: '0 0 80px rgba(245,239,224,0.6)' }
  			},
  			'fly-away': {
  				'0%': { transform: 'translate(0, 0) rotate(0) scale(1)', opacity: '1' },
  				'30%': { transform: 'translate(-8px, 6px) rotate(-8deg) scale(1.1)', opacity: '1' },
  				'100%': { transform: 'translate(90px, -140px) rotate(25deg) scale(0.4)', opacity: '0' }
  			},
  			poof: {
  				'0%': { opacity: '0', transform: 'scale(0.4) rotate(-20deg)' },
  				'50%': { opacity: '1', transform: 'scale(1.3) rotate(8deg)' },
  				'100%': { opacity: '1', transform: 'scale(1) rotate(0)' }
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			float: 'float 6s ease-in-out infinite',
  			rise: 'rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'scan-beam': 'scan-beam 1.5s ease-in-out infinite',
  			'ghost-sweep': 'ghost-sweep 1.5s ease-in-out forwards',
  			'ghost-fill': 'ghost-fill 1.5s linear forwards',
  			'ghost-card': 'ghost-card 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards',
  			'ghost-pop': 'ghost-pop 0.4s forwards',
  			bob: 'bob 3s ease-in-out infinite',
  			'ghost-suck': 'ghost-suck 0.8s ease-in forwards',
  			'ghost-jar': 'ghost-jar 0.35s 0.9s both',
  			seance: 'seance 3.4s ease-in-out infinite',
  			flicker: 'flicker 1.4s ease-in-out infinite',
  			'window-flicker': 'window-flicker 4s steps(1, end) infinite',
  			'fog-drift': 'fog-drift 14s ease-in-out infinite',
  			'bat-fly': 'bat-fly 11s linear infinite',
  			'moon-glow': 'moon-glow 5s ease-in-out infinite',
  			'fly-away': 'fly-away 0.9s cubic-bezier(0.5, 0, 0.75, 0) forwards',
  			poof: 'poof 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.3) both',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
