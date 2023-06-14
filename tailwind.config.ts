import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
      square: 'square'
    }
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true
  },
  variants: {
    textColor: ['group-hover', 'hover'],
    display: ['group-hover']
  }
}
